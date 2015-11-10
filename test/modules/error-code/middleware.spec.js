import { ErrorCodes, ErrorCode } from '../../../src/modules/error'
import HttpStatus from 'http-status'
import { anyString } from '../../util/any'
import { sample } from 'lodash'

describe('Error Code Middleware', () => {
  let originalStatusCode,
    middleware,
    context,
    expectedResult

  function next () {
    return expectedResult
  }

  function getRandomErrorCode () {
    const keys = Object.keys(ErrorCode),
      randomKey = sample(keys)

    return ErrorCode[randomKey]
  }

  beforeEach(() => {
    originalStatusCode = anyString()
    expectedResult = anyString()
    middleware = new ErrorCodes().middleware
    context = {
      res: {
        statusCode: originalStatusCode
      }
    }
  })

  it('should not change anything if no body is provided', () => {
    const result = middleware(context, next)

    expect(context.res.statusCode).to.equal(originalStatusCode)
    expect(result).to.equal(expectedResult)
  })

  it('should not change anything if a non-error body is provided', () => {
    context.body = anyString()

    const result = middleware(context, next)

    expect(context.res.statusCode).to.equal(originalStatusCode)
    expect(result).to.equal(expectedResult)
  })

  it('should set the status code to BAD_REQUEST if the body is an error code', () => {
    context.body = getRandomErrorCode()

    const result = middleware(context, next)

    expect(context.res.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(result).to.equal(expectedResult)
  })
})
