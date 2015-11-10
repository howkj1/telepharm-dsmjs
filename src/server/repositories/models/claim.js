import { STRING as sequelizeString, INTEGER as sequelizeInt } from 'sequelize'

export class Claim {
  static get schema () {
    return {
      userId: {
        type: sequelizeInt,
        primaryKey: true
      },
      value: {
        type: sequelizeString,
        primaryKey: true
      }
    }
  }
}
