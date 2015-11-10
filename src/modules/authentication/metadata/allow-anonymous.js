import { createDecorator } from '../../metadata'

class AllowAnonymousDecorator {
  middleware (context, next) {
    return next()
  }
}

export const AllowAnonymous = createDecorator(AllowAnonymousDecorator)
