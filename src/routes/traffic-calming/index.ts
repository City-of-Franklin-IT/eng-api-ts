import path from 'path'
import attachment from './attachment'
import petition from './petition'
import respondent from './respondent'
import response from './response'
import makeDocsRoute from '../makeDocsRoute'

// Types
import { Express, Router } from 'express'

const docsRoutes = makeDocsRoute('traffic-calming')

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }/${ path.basename(__dirname) }`

  const setURL = (urlPath: string, router: Router) => {
    return app.use(`${ baseURL }${ urlPath }`, router)
  }

  setURL('/attachment', attachment)
  setURL('/petition', petition)
  setURL('/respondent', respondent)
  setURL('/response', response)
  setURL('/docs', docsRoutes)
}