import milestone from './milestone'
import phase from './phase'
import project from './project'
import spending from './spending'
import update from './update'

// Types
import { Express, Router } from 'express'

export default (app: Express) => {
  const baseURL = '/api/v1/eng/stormwater'

  const setURL = (path: string, router: Router) => {
    return app.use(`${ baseURL }${ path }`, router)
  }

  setURL('/milestone', milestone)
  setURL('/phase', phase)
  setURL('/project', project)
  setURL('/spending', spending)
  setURL('/update', update)
}