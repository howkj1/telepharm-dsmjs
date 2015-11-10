import { Scope, getScopeFromClaim } from './scopes'
const ROLE_CLAIM_PREFIX = 'role:'
import { unique } from 'lodash'

export class RoleClass {
  constructor (name, assignedScope) {
    this.name = name
    this.scopes = assignedScope
  }

  toString () {
    return ROLE_CLAIM_PREFIX + this.name
  }
}

function createRole (...args) {
  return new RoleClass(...args)
}

export const Role = { // eslint-disable-line one-var
  admin: createRole('admin', [
    Scope.createClaim,
    Scope.deleteClaim,
    Scope.createUser
  ])
}

function isRole (claim) {
  return claim instanceof RoleClass
}

export function getScopesFromClaims (claims) {
  const roleClaims = claims.filter(isRole),
    scopeClaims = roleClaims.reduce((scopes, role) => {
      scopes.push(...role.scopes)
      return scopes
    }, [])

  return unique(scopeClaims)
}

export function convertClaims (claims) {
  if (!claims) {
    return []
  }

  const convertedClaims = claims.reduce((claimsSoFar, claim) => {
    if (claim.startsWith && claim.startsWith(ROLE_CLAIM_PREFIX)) {
      const roleKey = claim.replace(ROLE_CLAIM_PREFIX, ''),
        role = Role[roleKey],
        scopes = role.scopes

      claimsSoFar.push(role, ...scopes)
    } else {
      claimsSoFar.push(getScopeFromClaim(claim))
    }

    return claimsSoFar
  }, [])

  return unique(convertedClaims)
}
