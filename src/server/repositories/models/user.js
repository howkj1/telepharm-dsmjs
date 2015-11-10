import { STRING as sequelizeString } from 'sequelize'

export class User {
  static get schema () {
    return {
      hashedPassword: {
        type: sequelizeString
      },
      firstName: {
        type: sequelizeString(50)
      },
      middleName: {
        type: sequelizeString(50)
      },
      lastName: {
        type: sequelizeString(50)
      },
      email: {
        type: sequelizeString(50)
      },
      securityQuestion: {
        type: sequelizeString(100)
      },
      hashedSecurityAnswer: {
        type: sequelizeString
      }
    }
  }
}
