import { ApplicationContainer, provide } from '../../src/modules/dependency-injection'
import { anyString } from '../util/any'

describe('Dependency Injection Module', () => {
  let expectedRepositorySecret,
    applicationContainer

  class MyEnvironment {}

  class RepositoryClass {
    constructor () {
      this.secret = expectedRepositorySecret
    }
  }

  class ServiceClass {
    constructor (repository:RepositoryClass) {
      this.repositoryInstance = repository
    }
  }

  class ControllerClass {
    constructor (service:ServiceClass) {
      this.serviceInstance = service
    }
  }

  beforeEach(() => {
    expectedRepositorySecret = anyString()
    applicationContainer = new ApplicationContainer({
      providers: [ServiceClass, RepositoryClass],
      requestLifetimeProviders: [ControllerClass],
      contextToken: MyEnvironment
    })
  })

  it('should inject instances through constructors based on type', () => {
    const serviceInstance = applicationContainer.get(ServiceClass),
      repositoryInstance = serviceInstance.repositoryInstance

    expect(serviceInstance).to.be.an.instanceOf(ServiceClass)
    expect(repositoryInstance).to.be.an.instanceOf(RepositoryClass)
    expect(repositoryInstance.secret).to.be.equal(expectedRepositorySecret)
  })

  it('should return the same instances when a class is requested again', () => {
    const serviceInstance = applicationContainer.get(ServiceClass),
      serviceInstance2 = applicationContainer.get(ServiceClass)

    expect(serviceInstance).to.equal(serviceInstance2)
  })

  describe('request lifetime scope', () => {
    it('should not allow request lifetime scope types to be injected at the application level', () => {
      expect(() => applicationContainer.get(ControllerClass)).to.throw()
    })

    it('should allow a child lifetime scope to be created', () => {
      const childScope = applicationContainer.createRequestLifetimeContainer(),
        controllerInstance = childScope.get(ControllerClass)

      expect(controllerInstance).to.be.an.instanceOf(ControllerClass)
    })

    it('should provide the same instance for a class within the same child scope', () => {
      const childScope = applicationContainer.createRequestLifetimeContainer(),
        controllerInstance = childScope.get(ControllerClass),
        controllerInstance1 = childScope.get(ControllerClass)

      expect(controllerInstance).to.equal(controllerInstance1)
    })

    it('should provide a different instance for a class in a different child scope', () => {
      const childScope = applicationContainer.createRequestLifetimeContainer(),
        childScope1 = applicationContainer.createRequestLifetimeContainer(),
        controllerInstance = childScope.get(ControllerClass),
        controllerInstance1 = childScope1.get(ControllerClass)

      expect(controllerInstance).to.not.equal(controllerInstance1)
    })

    it('should allow additional bindings to be passed in to the child scope', () => {
      const expectedInjectedResult = anyString(),
        childScope = applicationContainer.createRequestLifetimeContainer([
          provide(MyEnvironment, {
            useFactory: () => expectedInjectedResult
          })
        ]),
        environmentResult = childScope.get(MyEnvironment)

      expect(environmentResult).to.equal(expectedInjectedResult)
    })
  })

  describe('middleware', () => {
    it('should provide a request lifetime scope property to the environment', () => {
      const env = new MyEnvironment(),
        next = sinon.spy(() => {
          const controllerInstance = env.scope.get(ControllerClass),
            envInstance = env.scope.get(MyEnvironment)

          expect(controllerInstance).to.be.an.instanceOf(ControllerClass)
          expect(controllerInstance.serviceInstance).to.be.an.instanceOf(ServiceClass)
          expect(envInstance).to.equal(env)
        })

      expect(env.scope).to.be.undefined
      applicationContainer.middleware(env, next)
      sinon.assert.calledOnce(next)
    })

    it('should provide a different controller for each request', () => {
      const env = new MyEnvironment(),
        env1 = new MyEnvironment(),
        next = () => {},
        middleware = applicationContainer.middleware

      expect(env.scope).to.be.undefined
      expect(env1.scope).to.be.undefined
      middleware(env, next)

      expect(env1.scope).to.be.undefined
      middleware(env1, next)

      expect(env.scope.get(MyEnvironment)).to.equal(env)
      expect(env1.scope.get(MyEnvironment)).to.equal(env1)

      expect(env.scope.get(ControllerClass)).to.not.equal(env1.scope.get(ControllerClass))
    })
  })
})
