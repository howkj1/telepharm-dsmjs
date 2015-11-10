import { Validate as createValidateDecorator } from '../validation'
import Joi from 'joi'
export * from '../validation'

const joiOptions = {
    abortEarly: false,
    allowUnknown: true
  },
  getJoiMessage = x => {
    return {
      path: x.path,
      message: x.message
    }
  }

function validateRequestParameter (context, parameter, joiSchema) {
  const joiResult = Joi.validate(context.req[parameter], joiSchema, joiOptions)

  if (joiResult.error) {
    return joiResult.error.details.map(getJoiMessage)
  }

  context.req[parameter] = joiResult.value

  return true
}

function createJoiVaidatorFor (parameter, joiSchema) {
  return createValidateDecorator((context) => validateRequestParameter(context, parameter, joiSchema))
}

export function ValidateBodyWithJoi (joiSchema) {
  return createJoiVaidatorFor('body', joiSchema)
}

export function ValidateParamsWithJoi (joiSchema) {
  return createJoiVaidatorFor('params', joiSchema)
}

export {
  Joi
}
