import path from 'path'
import complaints from './complaint'
import contacts from './contact'
import followUps from './followup'
import illicitDischarges from './illicitDischarge'
import inspectors from './inspector'
import logs from './log'
import siteContacts from './siteContact'
import sites from './site'
import violations from './violation'
import inactiveSites from './inactiveSite'
import incompleteSites from './incompleteSite'
import makeDocsRoute from '../makeDocsRoute'

// Types
import { Express, Router } from 'express'

const docsRoutes = makeDocsRoute('stormwater')

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }/${ path.basename(__dirname) }`

  const setURL = (urlPath: string, router: Router) => {
    return app.use(`${ baseURL }${ urlPath }`, router)
  }

  setURL('/complaint', complaints)
  setURL('/contact', contacts)
  setURL('/followup', followUps)
  setURL('/illicitdischarge', illicitDischarges)
  setURL('/inspector', inspectors)
  setURL('/log', logs)
  setURL('/sitecontact', siteContacts)
  setURL('/site', sites)
  setURL('/violation', violations)
  setURL('/inactive', inactiveSites)
  setURL('/incomplete', incompleteSites)
  setURL('/docs', docsRoutes)
}