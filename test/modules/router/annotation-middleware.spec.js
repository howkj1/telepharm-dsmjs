import { createDecorator } from '../../../src/modules/metadata'
import { anyString } from '../../util/any'
import { Route, MetadataRouter, HttpMethod } from '../../../src/modules/router'
import Promise from 'bluebird'

describe('Router Annotations With Middleware', () => {
  let expectedResponseCode1,
    expectedResponseCode2,
    expectedAsyncResponseCode,
    expectedUnauthorizedCode,
    resolveController,
    executeRouteAsync

  function setStatusCode (context, statusCode) {
    context.res.statusCode = statusCode
  }

  class SetResponseCode1Decorator {
    middleware (context, next) {
      setStatusCode(context, expectedResponseCode1)
      return next()
    }
  }

  class SetResponseCode2Decorator {
    middleware (context, next) {
      setStatusCode(context, expectedResponseCode2)
      return next()
    }
  }

  class AsyncDecorator {
    async middleware (context, next) {
      const code = await Promise.resolve(expectedAsyncResponseCode)
      setStatusCode(context, code)
      return next()
    }
  }

  class UnauthorizedDecorator {
    middleware (context) {
      setStatusCode(context, expectedUnauthorizedCode)
    }
  }

  class IgnoredDecorator {
    middleware (context, next) {
      setStatusCode(context, expectedResponseCode2)
      return next()
    }
  }

  const SetResponseCode1 = createDecorator(SetResponseCode1Decorator),
    SetResponseCode2 = createDecorator(SetResponseCode2Decorator),
    Unauthorized = createDecorator(UnauthorizedDecorator),
    AsyncResponseCode = createDecorator(AsyncDecorator),
    IgnoredStatus = createDecorator(IgnoredDecorator)

  beforeEach(() => {
    expectedResponseCode1 = anyString()
    expectedResponseCode2 = anyString()
    expectedAsyncResponseCode = anyString()
    expectedUnauthorizedCode = anyString()

    class TestController {
      @Route('responseCode')
      @SetResponseCode1()
      getResponseCode () {
      }

      @Route('unauthorized')
      @Unauthorized()
      getUnauthorized () {
      }

      @Route('async')
      @AsyncResponseCode()
      getAsync () {
      }

      @Route('ordered')
      @SetResponseCode2()
      @SetResponseCode1()
      getOrdered () {
      }

      @Route('reverseOrdered')
      @SetResponseCode1()
      @SetResponseCode2()
      getReverseOrdered () {
      }

      @Route('ignored')
      @IgnoredStatus()
      @SetResponseCode1()
      getIgnoredStatus () {
      }
    }

    resolveController = sinon.spy(Controller => new Controller())
    executeRouteAsync = new MetadataRouter({
      controllers: [TestController],
      resolveController: resolveController,
      annotations: [SetResponseCode1, SetResponseCode2, Unauthorized, AsyncResponseCode]
    }).middleware
  })

  function fakeOn (event, handler) {
    if ('end' === event) {
      handler()
    }
  }

  async function assertRequestHasResponseAsync ({ url, statusCode, expectEndpointMethodCalled }) {
    const response = {},
      context = {
        req: { url, method: HttpMethod.Get, on: fakeOn },
        res: response
      },
      next = sinon.spy(() => Promise.resolve())

    resolveController.reset()
    await executeRouteAsync(context, next)

    expect(response.statusCode).to.equal(statusCode, url)
    if (expectEndpointMethodCalled) {
      sinon.assert.calledOnce(resolveController, url)
      sinon.assert.calledOnce(next, url)
    } else {
      sinon.assert.notCalled(resolveController, url)
      sinon.assert.notCalled(next, url)
    }
  }

  it('should pass through middleware and then call an endpoint', () => {
    return assertRequestHasResponseAsync({
      url: 'responseCode',
      statusCode: expectedResponseCode1,
      expectEndpointMethodCalled: true
    })
  })

  it('should allow annotation middleware to short-circuit', () => {
    return assertRequestHasResponseAsync({
      url: 'unauthorized',
      statusCode: expectedUnauthorizedCode,
      expectEndpointMethodCalled: false
    })
  })

  it('should allow annotation middleware to be asyncrynous', () => {
    return assertRequestHasResponseAsync({
      url: 'async',
      statusCode: expectedAsyncResponseCode,
      expectEndpointMethodCalled: true
    })
  })

  it('should respect the order of the annotations on the method', async () => {
    await assertRequestHasResponseAsync({
      url: 'ordered',
      statusCode: expectedResponseCode2,
      expectEndpointMethodCalled: true
    })

    await assertRequestHasResponseAsync({
      url: 'reverseOrdered',
      statusCode: expectedResponseCode1,
      expectEndpointMethodCalled: true
    })
  })

  it('should ignore annotations that are not passed in the options of the router', () => {
    return assertRequestHasResponseAsync({
      url: 'ignored',
      statusCode: expectedResponseCode1,
      expectEndpointMethodCalled: true
    })
  })
})
