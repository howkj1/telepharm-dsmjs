import { getRoutesFromControllers } from './routes'
import RouteRecognizer from 'route-recognizer'
import HttpStatus from 'http-status'
import { parse as parseUrl } from 'url'

export class MetadataRouter {
  constructor (options) {
    this.routeMatcher = MetadataRouter.getRouteHandler(options)
  }

  static getRouteHandler (options) {
    const routes = getRoutesFromControllers(options),
      routeRecognizer = new RouteRecognizer(),
      routeMap = routes.reduce((pathHash, route) => {
        const path = route.path,
          pathRoute = pathHash[path] = pathHash[path] || {}
        route.httpMethods.forEach(method => {
          pathRoute[method] = route
        })
        return pathHash
      }, {})

    Object.keys(routeMap).map(path => {
      routeRecognizer.add([{
        path,
        handler: routeMap[path]
      }])
    })

    return (path, httpMethod) => {
      const matchingRoutes = routeRecognizer.recognize(path) || [],
        matchingRoute = matchingRoutes[0],
        handler = matchingRoute && matchingRoute.handler[httpMethod.toLowerCase()]

      if (handler) {
        handler.params = matchingRoute.params
      }

      return handler
    }
  }

  get middleware () {
    return (context, next) => {
      const { pathname } = parseUrl(context.req.url),
        request = context.req,
        response = context.res,
        handler = this.routeMatcher(pathname, request.method)

      if (handler) {
        context.req.params = handler.params
        return handler.executeAsync(context, next)
      }

      response.statusCode = HttpStatus.NOT_FOUND
      return next()
    }
  }
}
