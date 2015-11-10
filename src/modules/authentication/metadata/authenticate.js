import { createDecorator } from '../../metadata'
import HttpStatus from 'http-status'

class AuthenticateDecorator {
  middleware (context, next) {
    const authContext = context.authContext
    if (authContext.authenticated) {
      return next()
    }

    context.res.statusCode = HttpStatus.UNAUTHORIZED
  }
}

export const Authenticate = createDecorator(AuthenticateDecorator)
