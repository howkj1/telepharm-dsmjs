import 'reflect-metadata'
import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import fs from 'fs'

require.extensions['.html'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8') // eslint-disable-line no-sync
}

process.env.NODE_ENV = 'test'
global.chai = chai
global.expect = chai.expect
global.assert = chai.assert
global.sinon = sinon
chai.use(chaiAsPromised)
