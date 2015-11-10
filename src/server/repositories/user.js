import { Database } from './database'
import { User, Claim } from './models'

function getUserData (user) {
  return user.dataValues
}

export class UserRepository {
  constructor (db: Database) {
    this.Claim = db.getModel(Claim)
    this.User = db.getModel(User)
  }

  async createUserAccountAsync (data) {
    const account = await this.User.create(data)

    return {
      id: account.id
    }
  }

  async getUserAccountByIdAsync (id) {
    return this.getUserAccountWhereAsync({
      id
    })
  }

  getUserAccountByEmailAsync (email) {
    return this.getUserAccountWhereAsync({
      email
    })
  }

  async getUserAccountWhereAsync (where) {
    const user = await this.User.findOne({
      where
    })

    return user && getUserData(user)
  }

  updateUserAsync (user) {
    return this.User.update(user, {
      where: {
        id: user.id
      }
    })
  }

  createClaimAsync (claim) {
    return this.Claim.create(claim)
  }

  deleteClaimAsync (claim) {
    return this.Claim.destroy({
      where: claim
    })
  }

  getClaimsAsync (userId) {
    return this.Claim.findAll({
      where: {
        userId
      }
    })
  }

}
