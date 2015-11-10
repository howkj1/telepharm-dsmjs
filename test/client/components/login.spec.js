import { LoginComponent } from '../../../src/client/components/login/login'
import { UserService } from '../../../src/client/services'
import { injectComponentAsync, useProviders, provideClass } from '../util/inject'
import { anyEmail, anyPassword } from '../../util/any'
import Promise from 'bluebird'

describe('Login Component', () => {
  let expectedEmail,
    expectedPassword,
    expectedLoginResult

  class MockAccountService {
    attemptLoginAsync ({ email, password }) {
      expect(email).to.equal(expectedEmail)
      expect(password).to.equal(expectedPassword)

      return Promise.resolve(expectedLoginResult)
    }
  }

  useProviders([provideClass(UserService, MockAccountService)])

  beforeEach(() => {
    expectedEmail = anyEmail()
    expectedPassword = anyPassword()
    expectedLoginResult = {}
  })

  it('should submit the username and password to the login service', async () => {
    const component = await injectComponentAsync(LoginComponent),
      componentInstance = component.debugElement.componentInstance

    componentInstance.form.value.email = expectedEmail
    componentInstance.form.value.password = expectedPassword

    componentInstance.submitAsync()
  })
})
