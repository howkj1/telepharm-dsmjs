class ErrorCodeClass {
  constructor (name) {
    this.name = name
    this.json = JSON.stringify({
      errorCode: this.name
    })
  }

  toString () {
    return this.name
  }

  toJSON () {
    return this.json
  }

  get isErrorCode () {
    return true
  }
}

function createErrorCode (name) {
  return new ErrorCodeClass(name)
}

export const ErrorCode = {
  BadLogin: createErrorCode('BadLogin'),
  AccountLocked: createErrorCode('AccountLocked')
}
