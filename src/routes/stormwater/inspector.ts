import { Router } from 'express'
import { createInspector, getInspectors, getInspector, updateInspector, deleteInspector } from '@controllers/stormwater/inspector'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getInspectors)
  .post(requireWrite("stormwater"), createInspector)

router
  .route('/:slug')
  .get(getInspector)

router
  .route('/:inspectorid')
  .put(requireWrite("stormwater"), updateInspector)
  .delete(requireWrite("stormwater"), deleteInspector)

export default router