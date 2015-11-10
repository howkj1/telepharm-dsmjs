import { Component, FORM_DIRECTIVES, Validators, FormBuilder } from 'angular2/angular2'
import template from './login.html'
import { UserService } from '../../services'

@Component({
  selector: 'login',
  template,
  directives: [FORM_DIRECTIVES]
})
export class LoginComponent {
  constructor (userService: UserService, formBuilder: FormBuilder) {
    this.userService = userService
    this.form = formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  async submitAsync (event) {
    const loginResult = await this.userService.attemptLoginAsync(this.form.value)

    if (loginResult.errorCode) {
      this.error = loginResult.errorCode
    }

    event && event.preventDefault()
  }
}
