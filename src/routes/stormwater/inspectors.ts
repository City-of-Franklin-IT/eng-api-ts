import { Router } from 'express'
import { createInspector, getInspectors, getInspector, updateInspector, deleteInspector } from '@controllers/stormwater/inspectors'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(getInspectors)
  .post(createInspector)

router
  .route('/:uuid')
  .get(getInspector)
  .put(updateInspector)
  .delete(deleteInspector)

export default router