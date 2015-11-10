import { Component } from 'angular2/core'
import template from './sidebar-user.html'
import { UserService } from '../../services'

@Component({
  selector: 'sidebar-user',
  template
})
export class SidebarUserComponent {
  constructor (accountService: UserService) {
    this.accountService = accountService
  }

  logout () {
    this.accountService.logout()
  }
}
