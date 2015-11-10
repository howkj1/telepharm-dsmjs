import { models } from './models'
import Sequelize from 'sequelize'
import { env } from '../../modules/util/facade'

const configureTableNamesToNotBePluralized = {
  freezeTableName: true
}

export class Database {
  constructor () {
    this.sequelize = new Sequelize(
      `postgres://${env.DSM_PG_USERNAME}:${env.DSM_PG_PASSWORD}` +
      `@${env.DSM_PG_URL}:${env.DSM_PG_PORT}` +
      `/${env.DSM_PG_DATABASE}`, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: Boolean(env.DSM_PG_SSL)
        }
      }
    )

    this.types = {}
    models.forEach(Model => {
      const modelName = Model.name
      this.types[modelName] = this.sequelize.define(
        modelName,
        Model.schema,
        configureTableNamesToNotBePluralized
      )
    })

    this.types.Claim.belongsTo(this.types.User, { foreignKey: 'userId' })
  }

  syncAsync (options) {
    return this.sequelize.sync(options)
  }

  getModel (Type) {
    return this.types[Type.name]
  }
}
