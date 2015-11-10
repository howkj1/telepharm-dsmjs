import { getClaimsThatMatch } from '../../../src/modules/authentication/claims'
import { anyString, anyStrings } from '../../util/any'
import { sample } from 'lodash'

describe('Claims Tools', () => {
  describe('`getClaimsThatMatch`', () => {
    it('should match exact claims', () => {
      const claims = anyStrings(),
        expectedClaim = sample(claims),
        result = getClaimsThatMatch(claims, expectedClaim)

      expect(result).to.eql([expectedClaim])
    })

    it('should match wildcards', () => {
      const commonPrefix = anyString(),
        expectedClaims = [commonPrefix + anyString(), commonPrefix + anyString()].sort(),
        claims = anyStrings(2).concat(expectedClaims),
        result = getClaimsThatMatch(claims, commonPrefix + '*')

      expect(result.sort()).to.eql(expectedClaims)
    })

    it('should not match a partial claim', () => {
      const criteria = anyString(),
        claims = [anyString() + criteria + anyString(), criteria + anyString(), anyString() + criteria],
        result = getClaimsThatMatch(claims, criteria)

      expect(result).to.have.length(0)
    })
  })
})
