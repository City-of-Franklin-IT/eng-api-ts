import { Router } from 'express'
import { createInspector, getInspectors, getInspector, updateInspector, deleteInspector } from '@controllers/stormwater/inspector'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getInspectors)
  .post(createInspector)

router
  .route('/:inspectorid')
  .get(getInspector)
  .put(updateInspector)
  .delete(deleteInspector)

export default router