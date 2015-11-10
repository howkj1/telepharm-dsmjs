import { Component } from 'angular2/core'
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router'
import template from './main.html'
import { SidebarComponent } from '../sidebar/sidebar'
import { NavbarComponent } from '../navbar/navbar'
import { DashboardComponent } from '../dashboard/dashboard'

@RouteConfig([
  { path: '/', component: DashboardComponent, as: 'Dashboard' }
])
@Component({
  selector: 'main',
  template,
  directives: [SidebarComponent, NavbarComponent, ROUTER_DIRECTIVES]
})
export class MainComponent {
  constructor () {

  }
}
