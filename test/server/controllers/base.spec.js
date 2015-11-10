import { expectGetToReturnAsync } from '../util/route'
import { env } from '../../util/facade'

describe('Base Controller', () => {
  describe('index.html', () => {
    beforeEach(() => {
      expect(env.DSM_CDN, 'TP_CDN environment variable MUST be set!').to.not.be.undefined
    })

    async function expectPathToReturnIndexHtml (path) {
      const expectedSrcUrl = env.DSM_CDN + 'startup.client.js',
        indexHtmlResponse = await expectGetToReturnAsync({ path })

      expect(indexHtmlResponse.body).to.contain(expectedSrcUrl)
      expect(indexHtmlResponse.body).to.contain('class="loading-overlay"')
      expect(indexHtmlResponse.headers['content-type']).to.equal('text/html')
    }

    it('should load the index file from the cdn', async () => {
      await expectPathToReturnIndexHtml('/')
    })
  })
})
