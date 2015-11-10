import { Role, RoleClass, Scope, ScopeClass, getScopesFromClaims, convertClaims } from '../../../src/modules/roles'
import { anyString } from '../../util/any'
import { shuffle, unique, sample } from 'lodash'

describe('Roles', () => {
  const roleKeys = shuffle(Object.keys(Role))

  describe('RoleClass', () => {
    let role,
      expectedName,
      expectedScopes

    beforeEach(() => {
      expectedName = anyString()
      expectedScopes = [new ScopeClass(anyString()), new ScopeClass(anyString())]
      role = new RoleClass(expectedName, expectedScopes)
    })

    it('should expose the name and scopes', () => {
      expect(role.name).to.equal(expectedName)
      expect(role.scopes).to.equal(expectedScopes)
    })

    it('should convert to a string', () => {
      expect(role.toString()).to.equal('role:' + expectedName)
    })
  })

  describe('roles', () => {
    it('should export a list of roles with legitimate scopes', () => {
      roleKeys.forEach(roleKey => {
        const role = Role[roleKey]

        expect(role).to.be.an.instanceOf(RoleClass)
        expect(role.name).to.equal(roleKey)

        role.scopes.forEach(scope => {
          expect(scope).to.be.an.instanceOf(ScopeClass)
        })
      })
    })
  })

  describe('helper methods', () => {
    let expectedRoles,
      extraClaims,
      initialClaims,
      expectedExplodedScopes

    beforeEach(() => {
      extraClaims = [anyString(), { scopes: ['abc'] }]
      expectedRoles = [Role[roleKeys[0]]]
      initialClaims = shuffle(extraClaims.concat(expectedRoles))
      expectedExplodedScopes = unique(expectedRoles.reduce((claims, role) => {
        const scopesFromRole = role.scopes
        claims.push(...scopesFromRole)
        return claims
      }, [])).sort()
    })

    describe('`getScopesFromClaims`', () => {
      it('should return the Scope objects for any roles in the claims', () => {
        const scopes = getScopesFromClaims(initialClaims).sort()
        expect(scopes).to.eql(expectedExplodedScopes)
      })
    })

    describe('`convertClaims`', () => {
      it('should return an empty array if passed null', () => {
        expect(convertClaims(void 0)).to.eql([])
      })

      it('should change roles/scopes to their enum and explode roles into scopes', () => {
        const extraScope = sample(Scope),
          expectedResult = extraClaims
            .concat(expectedRoles)
            .concat(expectedExplodedScopes)
            .concat([extraScope]),
          inputScopes = extraClaims
            .concat(expectedRoles.map(role => role.toString()))
            .concat([extraScope].toString()),
          result = convertClaims(inputScopes)

        expect(result.sort()).to.eql(unique(expectedResult).sort())
      })
    })
  })
})
