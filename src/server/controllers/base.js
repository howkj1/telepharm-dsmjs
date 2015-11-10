import { Route } from '../../modules/router'
import { env } from '../../modules/util/facade'
import { AllowAnonymous } from '../../modules/authentication'

const staticIndexHtml = `
    <style type="text/css" rel="stylesheet">
      .loading-overlay {
        display: flex;
        height: 100%;
        background-color: #fff;
      }
      .loading-image {
        align-self: center;
        -webkit-align-self: center;
        animation: mymove 2s linear infinite;
        margin: 0 auto;
      }

      @keyframes mymove {
        0%   {transform: rotate3d(0,0,0,0)}
        20%  {transform: rotate3d(1, -1, 0, 180deg)}
        40%  {transform: rotate3d(1, -1, 0, 360deg)}
        55%, 85%  {transform: scale(1.1,1.1)}
        70%, 100%  {transform: scale(1,1)}
      }
    </style>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" integrity="sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ==" crossorigin="anonymous">
  </head>
  <body>
    <app>
      <div class="loading-overlay">
        <img class="loading-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAACoFBMVEUAAAAds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cds+cFCBsQAAAA33RSTlMAAQIDBAUGBwgJCgsMDQ4PEBETFBUWFxgZGhscHR4fICEiIyQlJygpKissLS4vMDEyMzU2Nzg5Ojs8PT9AQUJERUZISktMTU5PUFFSU1RWV1hZWltcXl9gYWJjZGVnaGprbG5wcXN0dXZ3eHl7fH1+f4CBgoOGh4iKi4yNjo+QkpOUlZeYmZqbnJ2foKGio6Slpqipqqusra6vsLGytLW2t7i5vL2+v8DCw8TFxsfI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"/>
      </div>
    </app>
  </body>
</html>`

function getIndexHtml () {
  return `<html>
  <head>
    <base href="/">
    <script crossorigin async src="${ env.DSM_CDN }startup.client.js"></script>` + staticIndexHtml
}

export class BaseController {
  @Route('/')
  @AllowAnonymous()
  getIndexHtml () {
    return getIndexHtml()
  }

  @Route('*path')
  @AllowAnonymous()
  getAnyIndexHtml () {
    return getIndexHtml()
  }
}
