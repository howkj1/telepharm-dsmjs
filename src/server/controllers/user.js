import { Authenticate, AllowAnonymous, Authorize } from '../../modules/authentication'
import { ValidateBodyWithJoi, ValidateParamsWithJoi } from '../../modules/validation-joi'
import { RoutePrefix, Route, Method, HttpMethod } from '../../modules/router'
import { Scope } from '../../modules/roles'
import { UserService } from '../services'
import Joi from 'joi'
import { Context } from 'server.app-builder'

const claimSchema = {
  value: Joi.string().required(),
  userId: Joi.number().required()
}

@RoutePrefix('user')
export class UserController {
  constructor (userService: UserService, context: Context) {
    this.userService = userService
    this.userId = context.authContext.id
  }

  @Route('/')
  @Method(HttpMethod.Post)
  @AllowAnonymous()
  async createUser ({ body }) {
    await this.userService.createUserAccountAsync(body)
  }

  @Route('/')
  @Method(HttpMethod.Put)
  @Authenticate()
  async updateUser ({ body }) {
    await this.userService.updateUserAsync(this.userId, body)
  }

  @Route('/')
  @Authenticate()
  async getUser () {
    return this.userService.getUserByIdAsync(this.userId)
  }

  @Route('token')
  @Method(HttpMethod.Post)
  @AllowAnonymous()
  generateToken ({ body }) {
    return this.userService.getTokenForUser(body)
  }

  @Route('changePassword')
  @Method(HttpMethod.Post)
  @Authenticate()
  async changePassword ({ body }) {
    const password = body.password,
      newPassword = body.newPassword

    return this.userService.changePassword(this.userId, password, newPassword)
  }

  @Route('claim')
  @Method(HttpMethod.Post)
  @Authorize(Scope.createClaim)
  @ValidateBodyWithJoi(claimSchema)
  async createClaim ({ body }) {
    this.userService.createClaimForAccountAsync(body)
  }

  @Route('claim/:userId/:value')
  @Method(HttpMethod.Delete)
  @Authorize(Scope.deleteClaim)
  @ValidateParamsWithJoi(claimSchema)
  async deleteClaim ({ params }) {
    this.userService.deleteClaimForAccountAsync(params)
  }
}
