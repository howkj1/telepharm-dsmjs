import { Authenticate, Authorize, AllowAnonymous } from '../../../src/modules/authentication'
import { anyStrings, anyString } from '../../util/any'
import { shuffle, sample } from 'lodash'
import { callAnnotationMiddleware } from '../util/annotations'
import HttpStatus from 'http-status'

describe('Authentication Annotations', () => {
  let authenticationContext,
    givenClaims,
    claimsIncludingAGivenClaim,
    claimsWithoutAnyGivenClaims

  beforeEach(() => {
    givenClaims = anyStrings(3)
    claimsIncludingAGivenClaim = shuffle([anyString(), sample(givenClaims)])
    claimsWithoutAnyGivenClaims = anyStrings(3)
  })

  function callMiddlewareWithAuthContext (AnnotationType, options = {}) {
    const context = {
      res: {},
      authContext: authenticationContext
    }
    options.context = context

    callAnnotationMiddleware(AnnotationType, options)
    return context.res
  }

  function assertRequestGoesThrough (AnnotationType, annotationArguments) {
    const response = callMiddlewareWithAuthContext(AnnotationType, {
      args: annotationArguments
    })

    expect(response.statusCode, `Expected no status code from annotation ${AnnotationType.name}`).to.be.undefined
  }

  function assertResponseIsUnauthorized (AnnotationType, annotationArguments) {
    const response = callMiddlewareWithAuthContext(AnnotationType, {
      args: annotationArguments,
      expectNextToBeCalled: false
    })

    expect(response.statusCode).to.equal(HttpStatus.UNAUTHORIZED, `Expected ${AnnotationType.name} to return UNAUTHORIZED`)
  }

  function assertResponseIsForbidden (AnnotationType, annotationArguments) {
    const response = callMiddlewareWithAuthContext(AnnotationType, {
      args: annotationArguments,
      expectNextToBeCalled: false
    })
    expect(response.statusCode).to.equal(HttpStatus.FORBIDDEN, `Expected ${AnnotationType.name} to return FORBIDDEN`)
  }

  describe('Given a user who is not authenticated', () => {
    beforeEach(() => {
      authenticationContext = {
        authenticated: false
      }
    })

    it('should allow anonymous', () => {
      assertRequestGoesThrough(AllowAnonymous)
    })

    it('should respond `UNAUTHORIZED` for `@Authenticate`', () => {
      assertResponseIsUnauthorized(Authenticate)
    })

    it('should respond `UNAUTHORIZED` for `@Authorize`', () => {
      assertResponseIsUnauthorized(Authorize, claimsIncludingAGivenClaim)
      assertResponseIsUnauthorized(Authorize, claimsWithoutAnyGivenClaims)
    })
  })

  describe('Given a user who is authenticated', () => {
    beforeEach(() => {
      authenticationContext = {
        authenticated: true,
        claims: givenClaims
      }
    })

    it('should allow anonymous', () => {
      assertRequestGoesThrough(AllowAnonymous)
    })

    it('should allow `@Authenticate`', () => {
      assertRequestGoesThrough(Authenticate)
    })

    it('should allow `@Authorize` with given claims', () => {
      assertRequestGoesThrough(Authorize, claimsIncludingAGivenClaim)
    })

    it('should respond `FORBIDDEN` for `@Authorize` with no given claims', () => {
      assertResponseIsForbidden(Authorize, claimsWithoutAnyGivenClaims)
    })
  })
})
