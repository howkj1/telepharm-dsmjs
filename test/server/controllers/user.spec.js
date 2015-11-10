import { expectPostToReturnAsync, expectPutToReturnAsync, postAsync, expectGetToReturnAsync, expectDeleteToReturnAsync } from '../util/route'
import { getRandomUserObject, getRandomUserWithTokenAsync, getRandomUserWithTokenAndClaimsAsync } from '../util/user'
import HttpStatus from 'http-status'
import { ErrorCode } from '../../../src/modules/error'
import { anyEmail, anyPassword, anyString, anyStrings } from '../../util/any'
import { applicationContainer } from '../util'
import { UserService } from '../../../src/server/services'
import { Role } from '../../../src/modules/roles'
import { sample, without } from 'lodash'

const grant_type = 'password'

function expectJsonContentType (response) {
  expect(response.headers['content-type']).to.equal('application/json')
}

describe('Account Controller', () => {
  var expectedUser,
    logInData

  beforeEach(() => {
    expectedUser = getRandomUserObject()
    logInData = {
      grant_type,
      username: expectedUser.email,
      password: expectedUser.password
    }
  })

  it('should allow users to be created', () =>
    expectPostToReturnAsync({ path: 'user', body: expectedUser })
  )

  it('should not allow a user account to be retrieved if not logged in', () =>
    expectGetToReturnAsync({ path: 'user' }, void 0, HttpStatus.UNAUTHORIZED)
  )

  describe('Given a user has been created', () => {
    beforeEach(async () => {
      const userService = applicationContainer.get(UserService),
        createUserResult = await userService.createUserAccountAsync(expectedUser)

      expectedUser.id = createUserResult.id

      delete expectedUser.hashedPassword
      delete expectedUser.userId
    })

    it('should allow a user to log in', async () => {
      const tokenResponse = await expectPostToReturnAsync({ path: 'user/token', body: logInData })
      expectJsonContentType(tokenResponse)
      expect(tokenResponse.body.token).to.be.a('string')
      expect(tokenResponse.body.data).to.eql({
        id: expectedUser.id,
        firstName: expectedUser.firstName,
        lastName: expectedUser.lastName,
        claims: []
      })
    })

    it('should return not found for an email that does not exist', () => {
      return expectPostToReturnAsync({
        path: 'user/token', body: {
          grant_type,
          username: anyEmail(),
          password: anyPassword()
        }
      }, ErrorCode.BadLogin)
    })

    it('should return not found for an incorrect password', () => {
      return expectPostToReturnAsync({
        path: 'user/token', body: {
          username: expectedUser.email,
          password: anyPassword()
        }
      }, ErrorCode.BadLogin)
    })

    describe('And the user logs in', () => {
      var authToken,
        headers

      beforeEach(async () => {
        const tokenResponse = await postAsync({ path: 'user/token', body: logInData })
        authToken = tokenResponse.body.token
        headers = {
          Authorization: 'Bearer ' + authToken
        }
      })

      it('should allow a user to retrieve their account information', async () => {
        const userResponse = await expectGetToReturnAsync({ path: 'user', headers })
        delete expectedUser.password
        expect(userResponse.body).to.contain(expectedUser)
        expect(userResponse.body.hashedPassword).to.be.undefined
      })
    })
  })

  describe('Given a user', () => {
    let user

    beforeEach(async () => {
      user = await getRandomUserWithTokenAsync()
    })

    it('should be able to change password', async () => {
      const newPassword = anyPassword()

      await expectPostToReturnAsync({
        path: 'user/changePassword',
        user,
        body: {
          password: user.password,
          newPassword
        }
      })

      await expectPostToReturnAsync({
        path: 'user/token',
        body: {
          grant_type,
          username: user.email,
          password: newPassword
        }
      })

      await expectPostToReturnAsync({
        path: 'user/token',
        body: {
          grant_type,
          username: user.email,
          password: user.password
        }
      }, ErrorCode.BadLogin)
    })

    it('should reject a password change with the incorrect password', async () => {
      await expectPostToReturnAsync({
        path: 'user/changePassword',
        user,
        body: {
          password: anyPassword(),
          newPassword: anyPassword()
        }
      }, ErrorCode.BadLogin)

      await expectPostToReturnAsync({
        path: 'user/token',
        body: {
          grant_type,
          username: user.email,
          password: user.password
        }
      })
    })

    it('should should allow a user to change their profile information', async () => {
      const newUserInfo = getRandomUserObject()

      await expectPutToReturnAsync({
        path: 'user',
        user,
        body: newUserInfo
      })

      const response = await expectGetToReturnAsync({ // eslint-disable-line one-var
          path: 'user',
          user
        }),
        updatedUser = response.body

      delete newUserInfo.password
      newUserInfo.email = user.email

      expect(updatedUser).to.contain(newUserInfo)
    })
  })

  describe('Given a user with admin claim', () => {
    let adminUser,
      otherUser

    beforeEach(async () => {
      adminUser = await getRandomUserWithTokenAndClaimsAsync(Role.admin)
      otherUser = await getRandomUserWithTokenAsync()
    })

    it('should be able to create a claim on an existing user', async () => {
      const expectedClaim = anyString()

      await expectPostToReturnAsync({
        path: 'user/claim',
        user: adminUser,
        body: {
          value: expectedClaim,
          userId: otherUser.id
        }
      })

      const tokenResponse = await expectPostToReturnAsync({ // eslint-disable-line one-var
        path: 'user/token', body: {
          grant_type,
          username: otherUser.email,
          password: otherUser.password
        }
      })

      expect(tokenResponse.body.data.claims).to.eql([expectedClaim])
    })

    describe('Given a user with multiple claims', () => {
      let initialClaims,
        claimToRemove

      beforeEach(async () => {
        initialClaims = anyStrings(3)
        claimToRemove = sample(initialClaims)
        otherUser = await getRandomUserWithTokenAndClaimsAsync(...initialClaims)
      })

      it('should be able to delete a claim', async () => {
        const expectedClaims = without(initialClaims, claimToRemove)

        await expectDeleteToReturnAsync({
          path: `user/claim/${ otherUser.id }/${ claimToRemove }`,
          user: adminUser
        })

        const tokenResponse = await expectPostToReturnAsync({ // eslint-disable-line one-var
          path: 'user/token', body: {
            grant_type,
            username: otherUser.email,
            password: otherUser.password
          }
        })

        expect(tokenResponse.body.data.claims.sort()).to.eql(expectedClaims.sort())
      })
    })
  })
})
