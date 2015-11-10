import Promise from 'bluebird'
import { env, stringify, jsonParse } from '../../util/facade'
import HttpStatus from 'http-status'
import { initializeEverythingAsync } from '../../../src/server/startup'
import { inject } from 'shot'

let requestHandlerAsync

async function getRequestHandlerAsync () {
  if (requestHandlerAsync) {
    return requestHandlerAsync
  }

  const requestHandler = await initializeEverythingAsync()
  requestHandlerAsync = request => {
    return new Promise((resolve) => {
      inject(requestHandler, request, (response) => {
        response.body = jsonParse(jsonParse(response.payload))
        resolve(response)
      })
    })
  }

  return requestHandlerAsync
}

async function makeRequestAsync (method, { path, headers, body, user }) {
  const handleRequestAsync = await getRequestHandlerAsync(),
    host = env.TELEPHARM_HOST || 'localhost',
    port = env.TELEPHARM_PORT || 8000,
    url = `http://${ host }:${ port }${ path ? '/' + path : '' }`,
    allHeaders = Object.assign({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }, headers)

  if (user && user.token) {
    allHeaders.Authorization = 'Bearer ' + user.token
  }

  return handleRequestAsync({ method, headers: allHeaders, url, payload: body })
}

function verifyResponse (response, { path, body }, expectedResponseContent, expectedHttpStatus = HttpStatus.OK) {
  const stringifiedBody = stringify(body)

  if (expectedResponseContent && expectedResponseContent.isErrorCode) {
    expect(response.body).to.eql(jsonParse(expectedResponseContent.toJSON()), 'Expected (' + path + ') to return error code ' + expectedResponseContent + ' when sent ' + stringifiedBody)
    expect(response.statusCode).to.equal(HttpStatus.BAD_REQUEST)
    expect(response.headers['content-type']).to.equal('application/json')
  } else {
    if (typeof expectedResponseContent !== 'undefined') {
      expect(response.body).to.eql(expectedResponseContent, 'Expected (' + path + ') to return different content when sent ' + stringifiedBody)
    }
    if (response.body.errorCode) {
      expect(response.statusCode).to.equal(expectedHttpStatus, 'Got error ' + response.body.errorCode + ' for (' + path + ') ' + ' when sent ' + stringifiedBody)
    }
    expect(response.statusCode).to.equal(expectedHttpStatus, 'Expected (' + path + ') to return status code ' + expectedHttpStatus + ' when sent ' + stringifiedBody + '\nGot back ' + stringify(response.body))
  }

  return response
}

export function getAsync (...args) {
  return makeRequestAsync('get', ...args)
}

export async function expectGetToReturnAsync (...args) {
  const response = await getAsync(...args)
  return verifyResponse(response, ...args)
}

export function postAsync (...args) {
  return makeRequestAsync('post', ...args)
}

export async function expectPostToReturnAsync (...args) {
  const response = await postAsync(...args)
  return verifyResponse(response, ...args)
}

export function putAsync (...args) {
  return makeRequestAsync('put', ...args)
}

export async function expectPutToReturnAsync (...args) {
  const response = await putAsync(...args)
  return verifyResponse(response, ...args)
}

export function deleteAsync (...args) {
  return makeRequestAsync('delete', ...args)
}

export async function expectDeleteToReturnAsync (...args) {
  const response = await deleteAsync(...args)
  return verifyResponse(response, ...args)
}
