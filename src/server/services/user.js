import { UserRepository } from '../repositories'
import { isDebug } from '../../modules/util/facade'
import { ErrorCode } from '../../modules/error'
import { createTokenAsync } from '../../modules/authentication'
import { hash as hashAsync, verify as verifyAsync } from 'derived-key'

export class UserService {
  constructor (userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async createUserAccountAsync (user) {
    user.hashedPassword = await this.hashSecretAsync(user.password)
    return this.userRepository.createUserAccountAsync(user)
  }

  async getUserByIdAsync (id) {
    const user = await this.userRepository.getUserAccountByIdAsync(id)
    delete user.hashedPassword
    return user
  }

  async getTokenForUser ({ username, password }) {
    const user = await this.userRepository.getUserAccountByEmailAsync(username),
      token = await this.getTokenForAccountAsync(user, password)

    if (token.isErrorCode) {
      return token
    }

    token.data.firstName = user.firstName
    token.data.lastName = user.lastName
    return token
  }

  async updateUserAsync (id, updatedUser) {
    const user = await this.userRepository.getUserAccountByIdAsync(id)

    user.firstName = updatedUser.firstName
    user.middleName = updatedUser.middleName
    user.lastName = updatedUser.lastName

    return this.userRepository.updateUserAsync(user)
  }

  hashSecretAsync (password) {
    if (isDebug) {
      return hashAsync(password, { iterations: 1 })
    }

    return hashAsync(password /*TODO: setup secure hashing configuration*/)
  }

  async getPasswordsMatchResultAsync (passwordToCheck, account) {
    if (await verifyAsync(passwordToCheck, account.hashedPassword)) {
      return {}
    }
    return {
      error: ErrorCode.BadLogin
    }
  }

  async createTokenResponseAsync (userId) {
    const claims = await this.userRepository.getClaimsAsync(userId),
      data = {
        id: userId,
        claims: claims.map(x => x.value)
      },
      token = await createTokenAsync(data)

    return {
      data,
      token
    }
  }

  async getTokenForAccountAsync (account, password) {
    if (!account) {
      return ErrorCode.BadLogin
    }

    var { error } = await this.getPasswordsMatchResultAsync(password, account)

    await this.userRepository.updateUserAsync(account)

    if (error) {
      return error
    }

    return this.createTokenResponseAsync(account.id)
  }

  async changePassword (userId, password, newPassword) {
    const user = await this.userRepository.getUserAccountByIdAsync(userId),
      { error } = await this.getPasswordsMatchResultAsync(password, user)

    await this.userRepository.updateUserAsync(user)

    if (error) {
      return error
    }

    user.hashedPassword = await this.hashSecretAsync(newPassword)
    return this.userRepository.updateUserAsync(user)
  }

  async createClaimForAccountAsync (claim) {
    return this.userRepository.createClaimAsync(claim)
  }

  async deleteClaimForAccountAsync (claim) {
    return this.userRepository.deleteClaimAsync(claim)
  }

}
