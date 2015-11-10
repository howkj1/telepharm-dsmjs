import { createDecorator } from '../metadata'
import HttpStatus from 'http-status'

class ValidateDecorator {
  constructor (validator) {
    this.validator = validator
  }

  get middleware () {
    return (context, next) => {
      const validationResult = this.validator(context),
        response = context.res

      if (validationResult === true) {
        return next()
      }

      response.statusCode = HttpStatus.BAD_REQUEST
      context.body = validationResult
    }
  }
}

export const Validate = createDecorator(ValidateDecorator)
