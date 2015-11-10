import { getAnnotationOfType } from '../../../src/modules/metadata'
import { anyString } from '../../util/any'

export function callAnnotationMiddleware (annotationFactory, {
                                                            args = [],
                                                            context = { req: {}, res: {} },
                                                            expectNextToBeCalled = true
                                                          } = {}) {
  class ClassWithAnnotation {
    @annotationFactory(...args)
    methodToTest () {}
  }

  const nextReturnValue = anyString(),
    DecoratorType = annotationFactory(...args),
    nextStub = sinon.stub().returns(nextReturnValue),
    classWithAnnotations = new ClassWithAnnotation(),
    annotation = getAnnotationOfType(classWithAnnotations, 'methodToTest', DecoratorType),
    result = annotation.middleware(context, nextStub)

  if (expectNextToBeCalled) {
    expect(result).to.equal(nextReturnValue, `Middleware for ${DecoratorType.MetadataType.name} did not return the value from next().  Make sure next() is called and the value is returned.`)
  } else {
    sinon.assert.notCalled(nextStub)
  }

  return context
}
