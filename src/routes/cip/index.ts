import path from 'path'
import milestone from './milestone'
import phase from './phase'
import project from './project'
import update from './update'
import makeDocsRoute from '../makeDocsRoute'

// Types
import { Express, Router } from 'express'

const docsRoutes = makeDocsRoute('cip')

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }/${ path.basename(__dirname) }`

  const setURL = (urlPath: string, router: Router) => {
    return app.use(`${ baseURL }${ urlPath }`, router)
  }

  setURL('/milestone', milestone)
  setURL('/phase', phase)
  setURL('/project', project)
  setURL('/update', update)
  setURL('/docs', docsRoutes)
}