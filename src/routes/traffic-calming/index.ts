import path from 'path'
import attachment from './attachment'
import petition from './petition'
import respondent from './respondent'
import response from './response'

// Types
import { Express, Router } from 'express'

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }${ path.basename(__dirname) }`

  const setURL = (path: string, router: Router) => {
    return app.use(`${ baseURL }${ path }`, router)
  }

  setURL('/attachment', attachment)
  setURL('/petition', petition)
  setURL('/respondent', respondent)
  setURL('/response', response)
}