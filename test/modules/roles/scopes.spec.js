import { Scope, ScopeClass, getScopeFromClaim } from '../../../src/modules/roles'
import { anyString } from '../../util/any'
import { sample } from 'lodash'

describe('Scopes', () => {
  const scopeKeys = Object.keys(Scope)

  describe('ScopeClass', () => {
    let scope,
      expectedName

    beforeEach(() => {
      expectedName = anyString()
      scope = new ScopeClass(expectedName)
    })

    it('should expose the name', () => {
      expect(scope.name).to.equal(expectedName)
    })

    it('should convert to a string', () => {
      expect(scope.toString()).to.equal('scope:' + expectedName)
    })

    it('should be able to disallow impersonation', () => {
      const scopeWithoutImpersonation = new ScopeClass(anyString, {
        allowImpersonation: false
      })

      expect(scopeWithoutImpersonation.allowImpersonation).to.be.false
    })

    it('should allow impersonation by default', () => {
      expect(scope.allowImpersonation).to.be.true
    })
  })

  describe('scopes', () => {
    it('should export a list of scopes', () => {
      scopeKeys.forEach(scopeKey => {
        const scope = Scope[scopeKey]

        expect(scope).to.be.an.instanceOf(ScopeClass)
        expect(scope.name).to.equal(scopeKey)
      })
    })
  })

  describe('`getScopeFromString`', () => {
    it('should return the scope object for a valid string', () => {
      const randomScopeKey = sample(scopeKeys),
        expectedScope = Scope[randomScopeKey],
        result = getScopeFromClaim(expectedScope.toString())

      expect(result).to.equal(expectedScope)
    })

    it('should return the input if it is not a valid scope string', () => {
      const randomClaim = anyString(),
        result = getScopeFromClaim(randomClaim)

      expect(result).to.equal(randomClaim)
    })

    it('should handle objects', () => {
      const randomClaim = { name: anyString() },
        result = getScopeFromClaim(randomClaim)

      expect(result).to.equal(randomClaim)
    })

    it('should not hand back a scope that is not prefixed', () => {
      const randomClaim = sample(scopeKeys),
        result = getScopeFromClaim(randomClaim)

      expect(result).to.equal(randomClaim)
    })
  })
})
