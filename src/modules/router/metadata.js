import { Route, RoutePrefix, Method } from './annotations'
import { getAnnotations, annotationIsOfType } from '../metadata/index'
import { HttpMethod } from './types'

function getAnnotationValue (annotations) {
  const annotation = annotations[0]
  return annotation && annotation.value
}

export function getAnnotationsOfType (target, Type, propertyKey) {
  const annotations = getAnnotations(target, propertyKey)
  return annotations.filter(annotation => annotationIsOfType(annotation, Type))
}

function getDefaultHttpMethodForMethod (methodName) {
  const httpMethodKey = Object.keys(HttpMethod).find((httpMethodName) =>
    methodName.startsWith(httpMethodName.toLowerCase()))

  if (httpMethodKey) {
    return HttpMethod[httpMethodKey]
  }

  return HttpMethod.Get
}

export function getMethods (target, methodName) {
  const httpMethods = getAnnotationValue(getAnnotationsOfType(target, Method, methodName)) || []

  if (!httpMethods.length) {
    httpMethods.push(getDefaultHttpMethodForMethod(methodName))
  }

  return httpMethods
}

export function getPath (target, routePrefix, methodName) {
  const annotations = getAnnotationValue(getAnnotationsOfType(target, Route, methodName)),
    path = annotations[0],
    ignoreRoutePrefix = path.substr(0, 1) === '~'

  if (ignoreRoutePrefix) {
    return path.substr(1)
  } else if (routePrefix) {
    return routePrefix + '/' + path
  }
  return path
}

export function getRoutePrefix (target) {
  return getAnnotationValue(getAnnotationsOfType(target, RoutePrefix))
}

export {
  getAnnotations,
  annotationIsOfType
}
