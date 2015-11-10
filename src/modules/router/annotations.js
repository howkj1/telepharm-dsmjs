import { createDecorator } from '../metadata/index'

function RoutePrefixDecorator (prefix) {
  this.value = prefix
}

function RouteDecorator (...paths) {
  this.value = paths
}

function HttpMethodDecorator (...methods) {
  this.value = methods
}

const RoutePrefix = createDecorator(RoutePrefixDecorator),
  Route = createDecorator(RouteDecorator),
  Method = createDecorator(HttpMethodDecorator)

export {
  RoutePrefix,
  Route,
  Method
}
