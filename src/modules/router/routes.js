import { getRoutePrefix, getPath, getMethods, getAnnotations, annotationIsOfType } from './metadata'
import { AppBuilder } from 'app-builder'
import { jsonParse } from '../util/facade'
import Promise from 'bluebird'

function annotationIsPermitted (annotation, permittedAnnotations) {
  return permittedAnnotations.some(permittedAnnotationType =>
    annotationIsOfType(annotation, permittedAnnotationType))
}

function bufferRequestBodyAsync (request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', chunk => {
      body += chunk
    })
    request.on('error', reject)
    request.on('end', () => resolve(body))
  })
}

async function parseBodyAsync (context, next) {
  const request = context.req
  request.body = jsonParse(await bufferRequestBodyAsync(request))

  return next()
}

function getRoutesFromController (Controller, resolveController, permittedAnnotations) {
  const basePath = getRoutePrefix(Controller)

  return Object.getOwnPropertyNames(Controller.prototype).reduce((routes, methodName) => {
    if (methodName === 'constructor') {
      return routes
    }

    const path = getPath(Controller, basePath, methodName),
      httpMethods = getMethods(Controller, methodName),
      annotations = getAnnotations(Controller, methodName),
      appBuilder = new AppBuilder()

    appBuilder.use(parseBodyAsync)

    annotations.forEach(annotation => {
      const annotationMiddleware = annotation.middleware
      if (annotationMiddleware && annotationIsPermitted(annotation, permittedAnnotations)) {
        appBuilder.use(annotationMiddleware)
      }
    })

    appBuilder.use(async (context, next) => {
      const controller = resolveController(Controller, context),
        request = context.req

      context.body = await Promise.resolve(controller[methodName]({
        params: request.params,
        body: request.body
      }))
      return next()
    })

    routes.push({
      path,
      httpMethods,
      methodName,
      Controller,
      annotations,
      executeAsync: appBuilder.build()
    })
    return routes
  }, [])
}

export function getRoutesFromControllers ({ controllers, resolveController, annotations }) {
  return controllers.reduce((routes, Controller) => routes.concat(getRoutesFromController(Controller, resolveController, annotations)), [])
}
