function getClaimFilter (criteria) {
  const matcher = new RegExp('^' + criteria.replace('*', '.*') + '$')
  return x => matcher.test(x)
}

export function getClaimsThatMatch (claims, criteria) {
  return claims.filter(getClaimFilter(criteria))
}
