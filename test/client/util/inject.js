import { createTestInjector, TestComponentBuilder } from 'angular2/testing'
import { services } from '../../../src/client/services'
import { provide, FORM_PROVIDERS } from 'angular2/angular2'
import { HTTP_PROVIDERS } from 'angular2/http'
import { MapWrapper } from 'angular2/src/core/facade/collection'

const providersForTestSuite = new Map()

function getProvidersForTest (providersForSpecificTest) {
  const providerMap = MapWrapper.clone(providersForTestSuite)

  providersForSpecificTest.forEach((provider) => {
    providerMap.set(provider.token, provider)
  })

  return Array.from(providerMap.values())
}

function getInjector (providersForSpecificTest) {
  const providers = getProvidersForTest(providersForSpecificTest)
  return createTestInjector(providers)
}

function useProviderForCurrentTestSuite (provider) {
  if (Array.isArray(provider)) {
    return useProviders(provider) // eslint-disable-line no-use-before-define
  }

  const token = provider.token || provider
  let oldProvider

  before(() => {
    oldProvider = providersForTestSuite.get(token)
    providersForTestSuite.set(token, provider)
  })

  after(() => {
    if (oldProvider) {
      providersForTestSuite.set(token, oldProvider)
    } else {
      providersForTestSuite.delete(token)
    }
  })
}

export async function injectComponentAsync (Component, providers = []) {
  const injector = getInjector(providers),
    testComponentBuilder = injector.get(TestComponentBuilder),
    component = await testComponentBuilder.createAsync(Component)

  component.detectChanges()

  return component
}

export function inject (token, providers = []) {
  providers.push(token)
  const injector = getInjector(providers)

  return injector.get(token)
}

export function provideClass (token, MockClass) {
  return provide(token, {
    useClass: MockClass
  })
}

export function useProviders (providers) {
  providers.forEach(useProviderForCurrentTestSuite)
}

useProviders([services, HTTP_PROVIDERS, FORM_PROVIDERS])

export {
  provide
}
