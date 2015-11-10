import { randomString } from '../../src/modules/random'
import { anyInteger } from '../util/any'

describe('Random String', () => {
  it('should return a string of the correct length', () => {
    const expectedLength = anyInteger({ min: 14, max: 27 }),
      resultString = randomString(expectedLength)

    expect(resultString).to.be.a('string')
    expect(resultString).to.have.length(expectedLength)
  })

  it('should return a different string when called twice', () => {
    const expectedLength = anyInteger({ min: 14, max: 27 }),
      resultString = randomString(expectedLength),
      resultString1 = randomString(expectedLength)

    expect(resultString).to.not.equal(resultString1)
  })
})
