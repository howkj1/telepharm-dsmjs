import { applicationContainer, database } from '../test/server/util/database'
import { UserService } from '../src/server/services'
import { each } from 'bluebird'
import seedData from './seed.json'
const userService = applicationContainer.get(UserService)

function createUserAsync (user) {
  return userService.createUserAccountAsync(user)
}

export async function seedAsync() {
  await database.syncAsync({ force: true })

  return each(seedData.users, createUserAsync)
}
