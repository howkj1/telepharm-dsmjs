import { Component } from 'angular2/core'
import template from './navbar.html'
import { ROUTER_DIRECTIVES } from 'angular2/router'

@Component({
  selector: '.navbar',
  template,
  directives: [ROUTER_DIRECTIVES]
})
export class NavbarComponent {
}
