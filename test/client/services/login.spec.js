import { LoginService } from '../../../src/client/services'
import { inject, provideClass } from '../util/inject'
import { Http } from 'angular2/http'
import { anyEmail, anyPassword } from '../../util/any'

describe('Login Service', () => {
  let loginService,
    expectedEmail,
    expectedPassword

  beforeEach(() => {
    expectedEmail = anyEmail()
    expectedPassword = anyPassword()

    loginService = inject(LoginService, [
      provideClass(Http)
    ])
  })

  describe('attemptLoginAsync', () => {
    describe('Given a valid email/password', () => {
      it('should eventually return true ', async () => {
        const result = await loginService.attemptLoginAsync(expectedEmail, expectedPassword)
        expect(result).to.be.true
      })
    })
  })
})
