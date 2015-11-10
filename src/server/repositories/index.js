import { UserRepository } from './user'
export * from './user'

import { Database } from './database'
export * from './database'

export const repositories = [
  UserRepository,
  Database
]
