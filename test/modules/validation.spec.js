import { Validate } from '../../src/modules/validation'
import { callAnnotationMiddleware } from './util/annotations'
import HttpStatus from 'http-status'

describe('Validate Annotation', () => {
  it('should call the validator with the context', () => {
    const expectedContext = {},
      validator = sinon.spy((context) => {
        expect(context).to.equal(expectedContext)
        return true
      })

    callAnnotationMiddleware(Validate, {
      args: [validator],
      context: expectedContext
    })

    sinon.assert.calledOnce(validator)
  })

  it('should pass through normally if the validator returns a === true value', () => {
    const validator = () => true,
      context = callAnnotationMiddleware(Validate, {
        args: [validator],
        expectNextToBeCalled: true
      })

    expect(context.res.statusCode).to.be.undefined
  })

  it('should cause a bad request if the validator returns a non true value', () => {
    const expectedErrorBody = {
        error: {}
      },
      validator = () => expectedErrorBody,
      context = callAnnotationMiddleware(Validate, {
        args: [validator],
        expectNextToBeCalled: false
      })

    expect(context.res.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(context.body).to.equal(expectedErrorBody)
  })
})
