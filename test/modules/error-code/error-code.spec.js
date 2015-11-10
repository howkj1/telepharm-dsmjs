import { ErrorCode } from '../../../src/modules/error'

describe('ErrorCode', () => {
  it('should use the key as the value', () => {
    const errorCodeKeys = Object.keys(ErrorCode)

    expect(errorCodeKeys.length).to.be.greaterThan(0)

    errorCodeKeys.forEach((errorCodeKey) => {
      expect(ErrorCode[errorCodeKey].toString()).to.equal(errorCodeKey)
      expect(ErrorCode[errorCodeKey].isErrorCode).to.be.true
      const json = ErrorCode[errorCodeKey].toJSON()
      expect(JSON.parse(json)).to.eql({
        errorCode: errorCodeKey
      })
    })
  })
})
