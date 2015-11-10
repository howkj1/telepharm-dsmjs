import { AppComponent } from '../../../src/client/components'
import { injectComponentAsync } from '../util/inject'

describe('App Component', () => {
  it('should exist', async () => {
    await injectComponentAsync(AppComponent)
  })
})
