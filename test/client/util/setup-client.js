import { Parse5DomAdapter } from 'angular2/src/core/dom/parse5_adapter'
import { window, global } from '../../util/facade'
global.jasmine = {
  addMatchers () {}
}

window.localStorage = {
  getItem (key) {
    return this[key]
  },

  setItem (key, value) {
    this[key] = value
  },

  removeItem (key) {
    delete this[key]
  }
}
Parse5DomAdapter.makeCurrent()
