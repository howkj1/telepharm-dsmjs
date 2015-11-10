const SCOPE_CLAIM_PREFIX = 'scope:'

export class ScopeClass {
  constructor (name, { allowImpersonation = true } = {}) {
    this.name = name
    this.allowImpersonation = allowImpersonation
  }

  toString () {
    return 'scope:' + this.name
  }
}

function createScope (...args) {
  return new ScopeClass(...args)
}

export const Scope = { //eslint-disable-line one-var
  createClaim: createScope('createClaim'),
  deleteClaim: createScope('deleteClaim'),
  createUser: createScope('createUser')
}

export function getScopeFromClaim (claim) {
  if (claim.startsWith && claim.startsWith(SCOPE_CLAIM_PREFIX)) {
    return Scope[claim.replace(SCOPE_CLAIM_PREFIX, '')]
  }

  return claim
}
