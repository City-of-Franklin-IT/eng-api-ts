import express from 'express'
import { createInspector, getInspectors, getInspector, updateInspector, deleteInspector } from '@controllers/stormwater/inspectors'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .get(getInspectors)
  .post(createInspector)

router
  .route('/:inspectorId')
  .get(getInspector)
  .put(updateInspector)
  .delete(deleteInspector)

export default router