import './styles/styles.scss'
import 'reflect-metadata'
import 'es6-shim'
import 'zone.js'
import { AppComponent } from './components'
import { MainComponent } from './components/main/main'
import { services } from './services'
import { bootstrap } from 'angular2/bootstrap'
import { provide, TemplateRef } from 'angular2/core'
import { HTTP_PROVIDERS } from 'angular2/http'
import { ROUTER_PROVIDERS, ROUTER_PRIMARY_COMPONENT } from 'angular2/router'

bootstrap(AppComponent, [
  services,
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  provide(ROUTER_PRIMARY_COMPONENT, { useValue: MainComponent }),
  TemplateRef
])
