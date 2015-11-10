import { createDecorator, getAnnotations, annotationIsOfType, getAnnotationOfType } from '../../src/modules/metadata'

describe('Metadata Module', () => {
  describe('retrieving metadata', () => {
    class MetaData {
      constructor (...args) {
        this.args = args
      }
    }

    const decorator = createDecorator(MetaData)
    @decorator()
    class Target {
      @decorator('some', 'args')
      method () {}
    }

    it('should return all annotations for a target class', () => {
      const annotations = getAnnotations(Target)
      expect(annotations).to.have.length(1)
      expect(annotations[0]).to.be.an.instanceof(decorator.MetadataType)
      expect(annotations[0].propertyKey).to.be.undefined
    })

    it('should return all annotations for a target method', () => {
      const annotations = getAnnotations(Target, 'method'),
        annotation = annotations[0]
      expect(annotations).to.have.length(1)
      expect(annotation).to.be.an.instanceof(decorator.MetadataType)
      expect(annotation.propertyKey).to.equal('method')
      expect(annotation.args).to.eql(['some', 'args'])
    })

    it('should return all annotations for a target method on an instance of the class', () => {
      const target = new Target(),
        annotations = getAnnotations(target, 'method'),
        annotation = annotations[0]
      expect(annotations).to.have.length(1)
      expect(annotation).to.be.an.instanceof(decorator.MetadataType)
    })

    it('should return an empty array for a target that has no annotations', () => {
      class ClassWithNoAnnotations {}
      expect(getAnnotations(ClassWithNoAnnotations)).to.eql([])
    })

    describe('`annotationIsOfType`', () => {
      it('should return `true` if an annotation is of the passed type', () => {
        const annotations = getAnnotations(Target, 'method'),
          annotation = annotations[0]

        expect(annotationIsOfType(annotation, decorator)).to.be.true
      })

      it('should return `false` if an annotation is of the passed type', () => {
        class OtherMetadata {}
        const annotations = getAnnotations(Target, 'method'),
          annotation = annotations[0],
          otherDecorator = createDecorator(OtherMetadata)

        expect(annotationIsOfType(annotation, otherDecorator)).to.be.false
      })
    })

    describe('`getAnnotationOfType`', () => {
      it('should return the first annotation of the passed type', () => {
        const annotationOfType = getAnnotationOfType(Target, 'method', decorator)

        expect(annotationIsOfType(annotationOfType, decorator)).to.be.true
      })

      it('should return null if no annotation if found of the passed type', () => {
        class OtherMetadata {}
        const otherDecorator = createDecorator(OtherMetadata),
          annotationOfType = getAnnotationOfType(Target, 'method', otherDecorator)

        expect(annotationOfType).to.be.undefined
      })
    })
  })

  describe('annotating methods', () => {
    class AnnotationMetadata {
    }
    let ClassWithMethodAnnotations,
      annotations,
      decorator

    beforeEach(() => {
      decorator = createDecorator(AnnotationMetadata)
      ClassWithMethodAnnotations = class {
        @decorator()
        method () {
        }

        @decorator()
        other () {
        }
      }

      annotations = Reflect.getOwnMetadata('annotations', ClassWithMethodAnnotations.prototype)
    })

    it('should store the metadata type on the decorator', () => {
      expect(decorator.MetadataType).to.equal(AnnotationMetadata)
      expect(decorator().MetadataType).to.equal(AnnotationMetadata)
    })

    it('should add the decorator to the prototype', () => {
      expect(annotations[0]).to.be.an.instanceof(AnnotationMetadata)
    })

    it('should have the method name on the annotation instance', () => {
      expect(annotations[0].propertyKey).to.equal('method')
    })

    it('should have multiple annotations for different methods', () => {
      expect(annotations[0].propertyKey).to.equal('method')
      expect(annotations[1].propertyKey).to.equal('other')
    })
  })

  describe('annotating classes', () => {
    class AnnotationMetadata {
    }
    let ClassWithAnnotations,
      annotations
    beforeEach(() => {
      const decorator = createDecorator(AnnotationMetadata)

      @decorator()
      class SomeClass {

      }

      ClassWithAnnotations = SomeClass

      annotations = Reflect.getOwnMetadata('annotations', ClassWithAnnotations)
    })

    it('should add the decorator to the prototype', () => {
      expect(annotations[0]).to.be.an.instanceof(AnnotationMetadata)
    })
  })
})
