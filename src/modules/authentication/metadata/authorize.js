import { createDecorator } from '../../metadata'
import HttpStatus from 'http-status'

function anyAuthorizedClaimsAreAcceptable (acceptableClaims, authorizedClaims) {
  return acceptableClaims.some(acceptableClaim => authorizedClaims.includes(acceptableClaim))
}
class AuthorizeDecorator {
  constructor (...claims) {
    this.claims = claims
  }

  get middleware () {
    return (context, next) => {
      const authContext = context.authContext,
        authorizedClaims = authContext.claims,
        acceptableClaims = this.claims,
        response = context.res

      if (!authContext.authenticated) {
        response.statusCode = HttpStatus.UNAUTHORIZED
      } else if (anyAuthorizedClaimsAreAcceptable(acceptableClaims, authorizedClaims)) {
        return next()
      } else {
        response.statusCode = HttpStatus.FORBIDDEN
      }
    }
  }
}

export const Authorize = createDecorator(AuthorizeDecorator)
