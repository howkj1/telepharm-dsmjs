import { controllers } from '../../../src/server/controllers'
import { Context } from 'server.app-builder'
import { services } from '../../../src/server/services'
import { repositories, Database } from '../../../src/server/repositories'
import { ApplicationContainer } from '../../../src/modules/dependency-injection'

const container = new ApplicationContainer({
    providers: services.concat(repositories),
    requestLifetimeProviders: controllers,
    contextToken: Context
  }),
  database = container.get(Database)

// need to check for before for the seed method
if (global.before) {
  before(async () => {
    await database.syncAsync({ force: true })
  })
}

export {
  container as applicationContainer,
  database
}
