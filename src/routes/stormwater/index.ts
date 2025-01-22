import path from 'path'
import attachments from './attachments'
import complaints from './complaints'
import contacts from './contacts'
import followUps from './followup'
import greenInfrastructure from './greenInfrastructure'
import illicitDischarges from './illicitDischarges'
import inspectors from './inspectors'
import logs from './logs'
import siteContacts from './siteContacts'
import sites from './sites'
import violations from './violations'

// Types
import { Express, Router } from 'express'

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }${ path.basename(__dirname) }`

  const setURL = (path: string, router: Router) => {
    return app.use(`${ baseURL }${ path }`, router)
  }

  setURL('/attachments', attachments)
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