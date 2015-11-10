import { applicationContainer, getRandomUserObject } from '../util/index'
import { UserRepository } from '../../../src/server/repositories/user'
import { anyInteger, anyEmail, anyPassword } from '../../util/any'

describe('User Repository', () => {
  let createUserResult,
    initialUser,
    userRepository

  beforeEach(async () => {
    userRepository = applicationContainer.get(UserRepository)
    initialUser = getRandomUserObject()
    initialUser.hashedPassword = anyPassword()
    createUserResult = await userRepository.createUserAccountAsync(initialUser)
  })

  function expectResultToMatchAccount (result) {
    const expectedUserAccount = {
      id: createUserResult.id,
      firstName: initialUser.firstName,
      middleName: initialUser.middleName,
      lastName: initialUser.lastName,
      email: initialUser.email,
      hashedPassword: initialUser.hashedPassword
    }

    expect(result).to.contain(expectedUserAccount)
  }

  describe('`createUser`', () => {
    it('should return a user with some ID', () => {
      expect(createUserResult).to.have.property('id').that.is.a('number')
      expect(createUserResult).to.have.all.keys(['id'])
    })
  })

  describe('`getUserAccountByIdAsync', () => {
    it('should return the user with their account information', async () => {
      const result = await userRepository.getUserAccountByIdAsync(createUserResult.id)
      expectResultToMatchAccount(result)
    })

    it('should return null for a bad id', async () => {
      const result = await userRepository.getUserAccountByIdAsync(anyInteger())
      expect(result).to.equal(null)
    })
  })

  describe('`getUserAccountByEmailAsync', () => {
    it('should return the user with their account information', async () => {
      const result = await userRepository.getUserAccountByEmailAsync(initialUser.email)
      expectResultToMatchAccount(result)
    })

    it('should return null for a bad email', async () => {
      const result = await userRepository.getUserAccountByEmailAsync(anyEmail())
      expect(result).to.equal(null)
    })
  })

  describe('`updateUserAsync`', () => {
    let newUserProperties,
      secondUser
    beforeEach(async () => {
      newUserProperties = getRandomUserObject()
      newUserProperties.id = createUserResult.id
      secondUser = getRandomUserObject()

      const secondUserResult = await userRepository.createUserAccountAsync(secondUser)
      secondUser.id = secondUserResult.id
      await userRepository.updateUserAsync(newUserProperties)
    })

    it('should update the user', async () => {
      const userAfterUpdate = await userRepository.getUserAccountByIdAsync(createUserResult.id)

      expect(userAfterUpdate).to.contain({
        firstName: newUserProperties.firstName,
        middleName: newUserProperties.middleName,
        lastName: newUserProperties.lastName,
        email: newUserProperties.email
      })
    })

    it('should not update other accounts', async () => {
      const secondUserAfterUpdate = await userRepository.getUserAccountByIdAsync(secondUser.id)

      expect(secondUserAfterUpdate).to.contain({
        firstName: secondUser.firstName,
        middleName: secondUser.middleName,
        lastName: secondUser.lastName
      })
    })
  })
})
