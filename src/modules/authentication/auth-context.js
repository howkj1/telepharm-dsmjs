import iron, { seal, unseal, defaults } from 'iron'
import { promisify } from 'bluebird'

iron.macPrefix = 'dsmJS'

//TODO
const password = 'MAKE-ME-AN-ENVIRONMENT-VARIABLE',
  verifyAndDecryptAsync = promisify(unseal),
  encryptAndMacAsync = promisify(seal),
  options = Object.assign({}, defaults)

export function createTokenAsync (authTicket) {
  return encryptAndMacAsync(authTicket, password, options)
}

export async function parseAuthContextAsync (token:String) {
  try {
    const authContext = await verifyAndDecryptAsync(token, password, options)
    authContext.authenticated = true
    return authContext
  } catch (e) {
    return {
      authenticated: false
    }
  }
}
