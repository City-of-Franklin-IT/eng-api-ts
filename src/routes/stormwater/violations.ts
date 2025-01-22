import express from 'express'
import { createViolation, getViolations, getViolation, updateViolation, deleteViolation } from '@controllers/stormwater/constructionViolations'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .get(getViolations)
  .post(createViolation)
  
router
  .route('/:uuid')
  .get(getViolation)
  .put(updateViolation)
  .delete(deleteViolation)

export default router