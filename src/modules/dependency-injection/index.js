import { Injector } from 'angular2/src/core/di/injector'
import { provide } from 'angular2/src/core/di/provider.js'
export { provide }

export class ApplicationContainer {

  constructor ({ providers, requestLifetimeProviders, contextToken }) {
    this.container = Injector.resolveAndCreate(providers)
    this.resolvedRequestLifetimeProviders = Injector.resolve(requestLifetimeProviders)
    this.contextToken = contextToken
  }

  createRequestLifetimeContainer (bindings = []) {
    const resolvedBindings = Injector.resolve(bindings),
      allResolvedLifetimeProviders = resolvedBindings.concat(this.resolvedRequestLifetimeProviders)

    return this.container.createChildFromResolved(allResolvedLifetimeProviders)
  }

  get middleware () {
    return (ctx, next) => {
      ctx.scope = this.createRequestLifetimeContainer(
        [provide(this.contextToken, { useValue: ctx })]
      )

      return next()
    }
  }

  get (...args) {
    return this.container.get(...args)
  }
}
