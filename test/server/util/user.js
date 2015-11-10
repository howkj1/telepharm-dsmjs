import any from '../../util/any'
import { applicationContainer } from './database'
import { UserService } from '../../../src/server/services'
import Promise from 'bluebird'

export function getRandomUserObject () {
  return {
    firstName: any.firstName(),
    middleName: any.middleName(),
    lastName: any.lastName(),
    email: any.email(),
    password: any.password()
  }
}

export async function getRandomUserWithTokenAndClaimsAsync (...claims) {
  const userService = applicationContainer.get(UserService),
    user = getRandomUserObject(),
    account = await userService.createUserAccountAsync(user)

  await Promise.all(claims.map(claim => userService.createClaimForAccountAsync({
    value: claim.toString(),
    userId: account.id
  })))

  user.id = account.id
  user.token = (await userService.getTokenForUser({
    username: user.email,
    password: user.password
  })).token

  return user
}

export function getRandomUserWithTokenAsync () {
  return getRandomUserWithTokenAndClaimsAsync()
}
