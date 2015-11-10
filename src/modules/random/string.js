import crypto from 'crypto'

const characterPool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-&^%$#',
  characterCount = characterPool.length

export function randomString (length) {
  const randomBytes = crypto.randomBytes(length),
    result = new Array(length)
  let cursor = 0

  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i]
    result[i] = characterPool[cursor % characterCount]
  }

  return result.join('')
}
