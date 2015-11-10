import { parseAuthContextAsync } from './auth-context'

export class AuthContext {

  constructor ({ authContextFactory = x => x } = {}) {
    this.authContextFactory = authContextFactory
  }

  get middleware () {
    return async (context, next) => {
      const authHeader = context.req.headers.authorization,
        token = authHeader && authHeader.replace('Bearer ', '')

      context.authContext = this.authContextFactory(await parseAuthContextAsync(token))

      return next()
    }
  }
}
