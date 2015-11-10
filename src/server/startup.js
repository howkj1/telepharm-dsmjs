import { env, isTest } from '../modules/util/facade'
import { MetadataRouter } from '../modules/router'
import { Server, Context } from 'server.app-builder'
import { controllers } from './controllers'
import { services } from './services'
import { repositories, Database } from './repositories'
import { ApplicationContainer } from '../modules/dependency-injection'
import { annotations as authAnnotations, AuthContext } from '../modules/authentication'
import { Validate } from '../modules/validation-joi'
import { ErrorCodes } from '../modules/error'
import { convertClaims } from '../modules/roles'

const server = new Server(),
  port = env.DSM_PORT,
  di = new ApplicationContainer({
    providers: services.concat(repositories),
    requestLifetimeProviders: controllers,
    contextToken: Context
  }),
  authContext = new AuthContext({
    authContextFactory: authCtx => {
      authCtx.claims = convertClaims(authCtx.claims)
      return authCtx
    }
  }),
  metadataRouter = new MetadataRouter({
    annotations: [Validate, ...authAnnotations],
    controllers,
    resolveController: (controller, environment) => environment.scope.get(controller)
  }),
  errorCode = new ErrorCodes(),
  handleServerError = (context, error) => {
    const res = context.res,
      stack = error.stack
    res.statusCode = void 0
    if (isTest) {
      context.res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Content-Length', Buffer.byteLength(stack))
      res.end(stack)
    }
    console.error(stack) // eslint-disable-line
  }

async function initializeEverythingAsync () {
  const database = di.get(Database)

  await database.syncAsync()
  server.useDefault(handleServerError)
  server.use(di.middleware)
  server.use(authContext.middleware)
  server.use(metadataRouter.middleware)
  server.use(errorCode.middleware)

  if (isTest) {
    return server.build()
  }

  await server.listen(port)
  console.log('Listening on port ' + port) // eslint-disable-line
}

if (!isTest) {
  initializeEverythingAsync()
}

export {
  initializeEverythingAsync
}
