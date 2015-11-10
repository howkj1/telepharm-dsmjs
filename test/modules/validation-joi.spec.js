import { ValidateBodyWithJoi, ValidateParamsWithJoi } from '../../src/modules/validation-joi'
import { callAnnotationMiddleware } from './util/annotations'
import { anyString, anyInteger } from '../util/any'
import Joi from 'joi'
import HttpStatus from 'http-status'

describe('ValidateBodyWithJoi Annotation', () => {
  let expectedBodyParameter,
    expectedParameterWithIntAsString,
    expectedContext

  beforeEach(() => {
    expectedBodyParameter = anyString()
    expectedParameterWithIntAsString = anyString()
    expectedContext = {
      req: {
        body: {
          [expectedBodyParameter]: anyString(),
          [expectedParameterWithIntAsString]: anyInteger().toString()
        }
      },
      res: {}
    }
  })

  it('should pass through for a valid input/schema', () => {
    const context = callAnnotationMiddleware(ValidateBodyWithJoi, {
      args: [{
        [expectedBodyParameter]: Joi.string(),
        [expectedParameterWithIntAsString]: Joi.number()
      }],
      context: expectedContext,
      expectNextToBeCalled: true
    })
    expect(context.res.statusCode).to.be.undefined
  })

  it('should do type coersion', () => {
    const context = callAnnotationMiddleware(ValidateBodyWithJoi, {
      args: [{
        [expectedParameterWithIntAsString]: Joi.number()
      }],
      context: expectedContext,
      expectNextToBeCalled: true
    })
    expect(context.req.body[expectedParameterWithIntAsString]).to.be.a('number')
  })

  it('should validate body with joi', () => {
    const withBadBody = callAnnotationMiddleware(ValidateBodyWithJoi, {
      args: [{
        [expectedBodyParameter]: Joi.number()
      }],
      context: expectedContext,
      expectNextToBeCalled: false
    })

    expect(withBadBody.res.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(withBadBody.body).to.eql([
      {
        path: expectedBodyParameter,
        message: `"${expectedBodyParameter}" must be a number`
      }
    ])
  })

  it('should return multiple errors', () => {
    const expectedSecondParameter = anyString(),
      withBadBody = callAnnotationMiddleware(ValidateBodyWithJoi, {
        args: [{
          [expectedBodyParameter]: Joi.number(),
          [expectedSecondParameter]: Joi.string().required()
        }],
        context: expectedContext,
        expectNextToBeCalled: false
      })

    expect(withBadBody.res.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(withBadBody.body).to.eql([
      {
        path: expectedBodyParameter,
        message: `"${expectedBodyParameter}" must be a number`
      },
      {
        path: expectedSecondParameter,
        message: `"${expectedSecondParameter}" is required`
      }
    ])
  })
})

describe('ValidateParamsWithJoi Annotation', () => {
  let expectedParameter,
    expectedParameterWithIntAsString,
    expectedContext

  beforeEach(() => {
    expectedParameter = anyString()
    expectedParameterWithIntAsString = anyString()
    expectedContext = {
      req: {
        params: {
          [expectedParameter]: anyString(),
          [expectedParameterWithIntAsString]: anyInteger().toString()
        }
      },
      res: {}
    }
  })

  it('should pass through for a valid input/schema', () => {
    const context = callAnnotationMiddleware(ValidateParamsWithJoi, {
      args: [{
        [expectedParameter]: Joi.string(),
        [expectedParameterWithIntAsString]: Joi.number()
      }],
      context: expectedContext,
      expectNextToBeCalled: true
    })
    expect(context.res.statusCode).to.be.undefined
  })

  it('should do type coersion', () => {
    const context = callAnnotationMiddleware(ValidateParamsWithJoi, {
      args: [{
        [expectedParameterWithIntAsString]: Joi.number()
      }],
      context: expectedContext,
      expectNextToBeCalled: true
    })
    expect(context.req.params[expectedParameterWithIntAsString]).to.be.a('number')
  })

  it('should validate params with joi', () => {
    const withBadParmas = callAnnotationMiddleware(ValidateParamsWithJoi, {
      args: [{
        [expectedParameter]: Joi.number()
      }],
      context: expectedContext,
      expectNextToBeCalled: false
    })

    expect(withBadParmas.res.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(withBadParmas.body).to.eql([
      {
        path: expectedParameter,
        message: `"${expectedParameter}" must be a number`
      }
    ])
  })

  it('should return multiple errors', () => {
    const expectedSecondParameter = anyString(),
      withBadParams = callAnnotationMiddleware(ValidateParamsWithJoi, {
        args: [{
          [expectedParameter]: Joi.number(),
          [expectedSecondParameter]: Joi.string().required()
        }],
        context: expectedContext,
        expectNextToBeCalled: false
      })

    expect(withBadParams.res.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(withBadParams.body).to.eql([
      {
        path: expectedParameter,
        message: `"${expectedParameter}" must be a number`
      },
      {
        path: expectedSecondParameter,
        message: `"${expectedSecondParameter}" is required`
      }
    ])
  })
})
