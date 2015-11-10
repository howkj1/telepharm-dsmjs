import { Http } from 'angular2/http'
import { stringify, jsonParse, window } from '../../modules/util/facade'

function storeAccount (account) {
  window.localStorage.account = window.btoa(stringify(account))
}

function getStoredAccount () {
  const storedToken = window.localStorage.getItem('account')
  return storedToken && jsonParse(window.atob(storedToken))
}

function deleteStoredAccount () {
  delete window.localStorage.account
}

export class UserService {
  constructor (http:Http) {
    this.http = http

    const account = getStoredAccount()
    if (account) {
      this.loadAccount(account)
    }
  }

  logout () {
    deleteStoredAccount()
    window.location.reload()
  }

  loadAccount (account) {
    this.user = account.data
    this.token = account.token
  }

  attemptLoginAsync ({ email, password }) {
    return this.http.post('/user/token',
      JSON.stringify({
        username: email,
        password
      }))
      .map(res => jsonParse(res.json()))
      .toPromise()
      .then(result => {
        storeAccount(result)
        this.loadAccount(result)

        return result
      })
  }
}
