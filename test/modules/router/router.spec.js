import { MetadataRouter, RoutePrefix, Route, Method, HttpMethod } from '../../../src/modules/router'
import { anyString } from '../../util/any'
import { stringify } from '../../util/facade'
import Promise from 'bluebird'

describe('Router Module', () => {
  let ControllerWithRoutes,
    ControllerWithoutPrefix,
    expectedPrefix,
    expectedPath,
    expectedPostPath,
    expectedResultBody,
    expectedEnvironment,
    controllerCreatedByFactory,
    resolveController,
    executeRouteAsync,
    nextStub,
    sandbox

  function mockBodyForRequest (request) {
    let body = request.body || '',
      dataEventHandler,
      errorEventHandler
    delete request.body
    request.on = (event, handler) => {
      if ('end' === event) {
        expect(errorEventHandler).to.be.a('function')
        expect(dataEventHandler).to.be.a('function')
        while (body) {
          dataEventHandler(body.slice(0, 1))
          body = body.substr(1)
        }
        handler()
      } else if ('error' === event) {
        errorEventHandler = handler
      } else if ('data' === event) {
        dataEventHandler = handler
      }
    }
  }

  async function handleRequestAsync (request) {
    resolveController.reset()
    expectedResultBody = void 0
    request.method = request.method.toUpperCase()
    mockBodyForRequest(request)
    expectedEnvironment = {
      req: request,
      res: {}
    }
    nextStub = sandbox.spy(() => Promise.resolve())

    await executeRouteAsync(expectedEnvironment, nextStub)

    return expectedEnvironment.res
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    resolveController = sandbox.spy((Controller, environment) => {
      Object.getOwnPropertyNames(Controller.prototype).forEach(methodName => {
        if (Controller.prototype[methodName].reset) {
          Controller.prototype[methodName].reset()
        } else {
          sandbox.spy(Controller.prototype, methodName)
        }
      })

      controllerCreatedByFactory = new Controller()

      expect(environment).to.equal(expectedEnvironment)
      return controllerCreatedByFactory
    })

    expectedPrefix = anyString()
    expectedPath = anyString()
    expectedPostPath = anyString()

    @RoutePrefix(expectedPrefix)
    class ControllerWithRoutesClass {
      @Route(expectedPath)
      @Method(HttpMethod.Delete)
      methodWithSpecificHttpMethod () {
      }

      @Route(expectedPostPath)
      postSomething () {
      }

      @Route('path/without/any/method')
      somethingWithoutAMethod () {
      }

      @Route('multi')
      @Method(HttpMethod.Post, HttpMethod.Get)
      postOrGetEndpoint () {
      }

      @Route('same')
      getSame () {
      }

      @Route('same')
      postSame () {
      }

      @Route('~bypass/prefix')
      bypassPrefix () {
      }

      @Route('user/:userId')
      getUser () {
      }

      @Route('somethingWithAResponseBody')
      getAResponseBody () {
        expectedResultBody = anyString()
        return expectedResultBody
      }

      @Route('promiseResult')
      getAPromiseResult () {
        expectedResultBody = anyString()
        return Promise.resolve(expectedResultBody)
      }
    }
    ControllerWithRoutes = ControllerWithRoutesClass

    class ControllerWithoutPrefixClass {
      @Route('unprefixed')
      getUnprefixed () {
      }

      @Route('')
      getPathless () {
      }
    }
    ControllerWithoutPrefix = ControllerWithoutPrefixClass

    executeRouteAsync = new MetadataRouter({
      controllers: [ControllerWithRoutes, ControllerWithoutPrefix],
      resolveController: resolveController
    }).middleware
  })

  afterEach(() => sandbox.restore())

  async function assertRequestTriggersCallAsync (request, Controller, methodName, expectedControllerParameters = { params: {}, body: '' }) {
    const response = await handleRequestAsync(request),
      failureMessage = stringify(request)

    expect(controllerCreatedByFactory).to.be.an.instanceOf(Controller)
    sinon.assert.calledOnce(controllerCreatedByFactory[methodName])
    sinon.assert.calledWith(controllerCreatedByFactory[methodName], expectedControllerParameters)
    Object.getOwnPropertyNames(Controller.prototype).forEach(otherMethodName => {
      if (otherMethodName !== methodName) {
        sinon.assert.notCalled(controllerCreatedByFactory[otherMethodName], failureMessage)
      }
    })

    expect(response.statusCode).to.be.undefined
    sinon.assert.calledOnce(resolveController, failureMessage)
    sinon.assert.calledOnce(nextStub)
    expect(expectedEnvironment.body).to.equal(expectedResultBody)
  }

  async function assertRequestCausesNotFoundAsync (request) {
    const response = await handleRequestAsync(request),
      failureMessage = stringify(request)

    expect(response.statusCode).to.equal(404, failureMessage)
    sinon.assert.notCalled(resolveController, failureMessage)
    sinon.assert.calledOnce(nextStub)
  }

  function assertRequestCallsControllerMethodForHttpMethodsAsync ({ url, httpMethods, Controller, methodName, expectedControllerParameters, body }) {
    return Promise.each(Object.keys(HttpMethod), httpMethodKey => {
      const httpMethod = HttpMethod[httpMethodKey],
        request = { url, method: httpMethod, body }

      if (httpMethods.includes(httpMethod)) {
        return assertRequestTriggersCallAsync(request, Controller, methodName, expectedControllerParameters)
      }

      return assertRequestCausesNotFoundAsync(request)
    })
  }

  it('should handle methods defined with the annotation http method', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/' + expectedPath,
      httpMethods: [HttpMethod.Delete],
      Controller: ControllerWithRoutes,
      methodName: 'methodWithSpecificHttpMethod'
    })
  })

  it('should automatically detect http method from controller method name', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/' + expectedPostPath,
      httpMethods: [HttpMethod.Post],
      Controller: ControllerWithRoutes,
      methodName: 'postSomething'
    })
  })

  it('should allow get requests through if no other method can be deduced', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/path/without/any/method',
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithRoutes,
      methodName: 'somethingWithoutAMethod'
    })
  })

  it('should allow endpoints to take multiple http methods', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/multi',
      httpMethods: [HttpMethod.Post, HttpMethod.Get],
      Controller: ControllerWithRoutes,
      methodName: 'postOrGetEndpoint'
    })
  })

  it('should allow multiple endpoints with the same path but different methods', async () => {
    const url = expectedPrefix + '/same'
    await assertRequestTriggersCallAsync({ url, method: HttpMethod.Post }, ControllerWithRoutes, 'postSame')
    await assertRequestTriggersCallAsync({ url, method: HttpMethod.Get }, ControllerWithRoutes, 'getSame')
    await assertRequestCausesNotFoundAsync({ url, method: HttpMethod.Delete })
    await assertRequestCausesNotFoundAsync({ url, method: HttpMethod.Put })
  })

  it('should allow for controllers without a RoutePrefix', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: '/unprefixed',
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithoutPrefix,
      methodName: 'getUnprefixed'
    })
  })

  it('should allow for a route with absolutely no path', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: '/',
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithoutPrefix,
      methodName: 'getPathless'
    })
  })

  it('should allow endpoints to ignore the route prefix with a leading `~`', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: '/bypass/prefix',
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithRoutes,
      methodName: 'bypassPrefix'
    })
  })

  it('should pass params to the controller', async () => {
    const expectedUserId = anyString()
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/user/' + expectedUserId,
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithRoutes,
      methodName: 'getUser',
      expectedControllerParameters: {
        body: '',
        params: {
          userId: expectedUserId
        }
      }
    })
  })

  it('should pass body to the controller', async () => {
    const expectedBody = {
      [anyString()]: anyString()
    }
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/' + expectedPostPath,
      body: stringify(expectedBody),
      httpMethods: [HttpMethod.Post],
      Controller: ControllerWithRoutes,
      methodName: 'postSomething',
      expectedControllerParameters: {
        params: {},
        body: expectedBody
      }
    })
  })

  it('should handle a promise result', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/promiseResult',
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithRoutes,
      methodName: 'getAPromiseResult'
    })
  })

  it('should set the response onto the body of the context', async () => {
    await assertRequestCallsControllerMethodForHttpMethodsAsync({
      url: expectedPrefix + '/somethingWithAResponseBody',
      httpMethods: [HttpMethod.Get],
      Controller: ControllerWithRoutes,
      methodName: 'getAResponseBody'
    })
  })
})
