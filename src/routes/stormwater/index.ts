import path from 'path'
import complaints from './complaint'
import contacts from './contact'
import followUps from './followup'
import greenInfrastructure from './greenInfrastructure'
import illicitDischarges from './illicitDischarge'
import inspectors from './inspector'
import logs from './log'
import siteContacts from './siteContact'
import sites from './site'
import violations from './violation'

// Types
import { Express, Router } from 'express'

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }/${ path.basename(__dirname) }`

  const setURL = (path: string, router: Router) => {
    return app.use(`${ baseURL }${ path }`, router)
  }

  setURL('/complaints', complaints)
  setURL('/contacts', contacts)
  setURL('/followup', followUps)
  setURL('/greeninfrastructure', greenInfrastructure)
  setURL('/illicitdischarges', illicitDischarges)
  setURL('/inspectors', inspectors)
  setURL('/logs', logs)
  setURL('/sitecontacts', siteContacts)
  setURL('/sites', sites)
  setURL('/violations', violations)
}