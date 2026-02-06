import path from 'path'
import approval from './approval'
import milestoneExtension from './extension'
import milestone from './milestone'
import notification from './notification'
import vestingPeriod from './period'
import project from './project'
import resolution from './resolution'
import vestingExtension from './vesting-extension'
import makeDocsRoute from '../makeDocsRoute'

// Types
import { Express, Router } from 'express'

const docsRoutes = makeDocsRoute('vesting')

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }/${ path.basename(__dirname) }`

  const setURL = (urlPath: string, router: Router) => {
    return app.use(`${ baseURL }${ urlPath }`, router)
  }

  setURL('/approval', approval)
  setURL('/extension', milestoneExtension)
  setURL('/milestone', milestone)
  setURL('/notification', notification)
  setURL('/period', vestingPeriod)
  setURL('/project', project)
  setURL('/resolution', resolution)
  setURL('/vesting-extension', vestingExtension)
  setURL('/docs', docsRoutes)
}