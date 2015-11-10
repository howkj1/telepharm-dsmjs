import { Component, NgIf } from 'angular2/angular2'
import template from './app.html'
import { LoginComponent } from '../login/login'
import { MainComponent } from '../main/main'
import { UserService } from '../../services'

@Component({
  selector: 'app',
  template,
  directives: [LoginComponent, MainComponent, NgIf]
})
export class AppComponent {
  constructor (accountService: UserService) {
    this.accountService = accountService
  }

  get loggedIn () {
    return Boolean(this.accountService.user)
  }
}
