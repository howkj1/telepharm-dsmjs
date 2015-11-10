import { Component } from 'angular2/core'
import template from './sidebar.html'
import { SidebarUserComponent } from '../sidebar-user/sidebar-user'
import { ROUTER_DIRECTIVES } from 'angular2/router'

@Component({
  selector: '.sidebar',
  template,
  directives: [SidebarUserComponent, ROUTER_DIRECTIVES]
})
export class SidebarComponent {
}
