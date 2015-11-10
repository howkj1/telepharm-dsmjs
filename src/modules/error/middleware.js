import HttpStatus from 'http-status'

export class ErrorCodes {
  middleware (context, next) {
    const body = context.body

    if (body && body.isErrorCode) {
      context.res.statusCode = HttpStatus.BAD_REQUEST
    }

    return next()
  }
}
