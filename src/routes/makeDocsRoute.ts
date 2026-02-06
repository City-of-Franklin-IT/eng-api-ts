import { Router } from 'express'
import path from 'path'
import { entra } from '@middleware/auth'

type AppRouteType = 'cip' | 'stormwater' | 'traffic-calming' | 'vesting'

type DocNameType =
  | 'CIP.postman_collection.json'
  | 'Stormwater.postman_collection.json'
  | 'Traffic Calming.postman_collection.json'
  | 'Vesting.postman_collection.json'

export const docsMap = new Map<AppRouteType, DocNameType>([
  ['cip', 'CIP.postman_collection.json'],
  ['stormwater', 'Stormwater.postman_collection.json'],
  ['traffic-calming', 'Traffic Calming.postman_collection.json'],
  ['vesting', 'Vesting.postman_collection.json']
])

const docsPath = process.env.NODE_ENV === 'development'
  ? '/mnt/docs' :
  '/opt/docs'

const makeDocsRoute = (appRoute: AppRouteType) => {
  const router = Router()
  router.use(entra)
  router.get('/', (_req, res) => {
    res.sendFile(path.join(docsPath, docsMap.get(appRoute)!))
  })
  return router
}

export default makeDocsRoute
