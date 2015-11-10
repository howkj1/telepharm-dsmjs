import { AuthContext, createTokenAsync } from '../../../src/modules/authentication'
import { anyString, anyStrings } from '../../util/any'

describe('Authentication Middleware', () => {
  const expectedDefaultAuthContext = {
    authenticated: false
  }

  async function expectMiddlewareToSetAuthContextAsync (token, expectedAuthContext, options) {
    const middleware = new AuthContext(options).middleware,
      expectedResult = anyString(),
      nextStub = sinon.stub().returns(expectedResult),
      context = {
        req: {
          headers: {
            authorization: token ? 'Bearer ' + token : void 0
          }
        }
      },
      result = await middleware(context, nextStub)

    expect(result).to.equal(expectedResult)
    expect(context.authContext).to.eql(expectedAuthContext)
  }

  it('should provide a default context if no token is provided', () => {
    return expectMiddlewareToSetAuthContextAsync('', expectedDefaultAuthContext)
  })

  it('should set a valid auth context if the token is valid', async () => {
    const accountId = anyString(),
      claims = anyStrings(),
      randomPropertyKey = anyString(),
      randomPropertyValue = anyString(),
      token = await createTokenAsync({
        accountId,
        claims,
        [randomPropertyKey]: randomPropertyValue
      })

    expect(token).to.be.a('string')
    expect(token.indexOf(accountId)).to.equal(-1, 'token must obfuscate the auth context!')

    await expectMiddlewareToSetAuthContextAsync(token, {
      authenticated: true,
      accountId,
      claims,
      [randomPropertyKey]: randomPropertyValue
    })
  })

  it('should provide a default context if an invalid token is provided', () => {
    return expectMiddlewareToSetAuthContextAsync(anyString(), expectedDefaultAuthContext)
  })

  it('should allow an override for the authContextFactory', async () => {
    const accountId = anyString(),
      claims = anyStrings(),
      randomPropertyKey = anyString(),
      randomPropertyValue = anyString(),
      expectedTokenContents = {
        accountId,
        claims,
        [randomPropertyKey]: randomPropertyValue
      },
      token = await createTokenAsync(expectedTokenContents),
      expectedAuthContext = anyString(),
      authContextFactory = (parsedToken) => {
        expectedTokenContents.authenticated = true
        expect(parsedToken).to.eql(expectedTokenContents)

        return expectedAuthContext
      }

    return expectMiddlewareToSetAuthContextAsync(token, expectedAuthContext, {
      authContextFactory
    })
  })
})
