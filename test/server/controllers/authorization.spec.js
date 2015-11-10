import { controllers } from '../server-controllers'
import { getAnnotations, annotationIsOfType } from '../../../src/modules/metadata'
import { Authenticate, Authorize, AllowAnonymous } from '../../../src/modules/authentication'

function ignoreConstructor (methodName) {
  return methodName !== 'constructor'
}

function isAuthAnnotation (annotation) {
  return annotationIsOfType(annotation, Authenticate) ||
    annotationIsOfType(annotation, Authorize) ||
    annotationIsOfType(annotation, AllowAnonymous)
}

function assertAllControllerMethodsHaveExplicitAuthenticationSettings (Controller) {
  Object.getOwnPropertyNames(Controller.prototype)
    .filter(ignoreConstructor)
    .map(methodName => {
      const annotations = getAnnotations(Controller, methodName),
        authAnnotationCount = annotations.filter(isAuthAnnotation).length

      expect(authAnnotationCount).to.be.greaterThan(0, methodName + ' on ' + Controller.name + ' does not have explicit authentication settings!')
      expect(authAnnotationCount).to.be.lessThan(2, methodName + ' on ' + Controller.name + ' has multiple authentication settings!')
    })
}

describe('Authorization of Endpoints', () => {
  it('should have security for every endpoint', () => {
    controllers.forEach(assertAllControllerMethodsHaveExplicitAuthenticationSettings)
  })
})
