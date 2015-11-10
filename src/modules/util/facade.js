import Bluebird from 'bluebird'
import 'reflect-metadata'

const delay = Bluebird.delay,
  __global = typeof window === 'object' ? window : global,  // eslint-disable-line
  __window = typeof window === 'object' ? window : __global.window || {}, // eslint-disable-line
  defer = global.setTimeout,
  env = global.process && global.process.env || {},
  stringify = JSON.stringify,
  jsonParse = (jsonString) => {
    try {
      return JSON.parse(jsonString)
    } catch (e) {
      return jsonString
    }
  },
  isDebug = env.NODE_ENV === 'debug' || env.NODE_ENV === 'test',
  isTest = env.NODE_ENV === 'test'

export {
  jsonParse,
  stringify,
  Bluebird as Promise,
  delay,
  __global as global,
  __window as window,
  Reflect,
  defer,
  env,
  isDebug,
  isTest
}
