import { global } from '../util/facade'

const Reflect = global.Reflect

function getAnnotationsFromTarget (target) {
  return Reflect.getOwnMetadata('annotations', target) || []
}

export function createDecorator (AnnotationClass) {
  function decoratorFactory (...args) {
    const annotationInstance = new AnnotationClass(...args)

    function typeDecorator (target, propertyKey) {
      const annotations = getAnnotationsFromTarget(target)
      annotationInstance.propertyKey = propertyKey
      annotations.push(annotationInstance)
      Reflect.defineMetadata('annotations', annotations, target)
    }
    typeDecorator.MetadataType = AnnotationClass
    return typeDecorator
  }

  decoratorFactory.MetadataType = AnnotationClass
  return decoratorFactory
}

export function getAnnotations (target, method) {
  if (method) {
    target = target.prototype ? target.prototype : target.constructor.prototype
  }
  return getAnnotationsFromTarget(target).filter(annotation => annotation.propertyKey === method)
}

export function annotationIsOfType (annotation, Type) {
  return annotation instanceof Type.MetadataType
}

export function getAnnotationOfType (target, method, Type) {
  const annotations = getAnnotations(target, method)

  return annotations.find(annotation => annotationIsOfType(annotation, Type))
}
