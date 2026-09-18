import { Router } from 'express'
import { createViolation, getViolations, getViolation, updateViolation, deleteViolation } from '@controllers/stormwater/constructionViolation'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getViolations)
  .post(requireWrite("stormwater"), createViolation)
  
router
  .route('/:uuid')
  .get(getViolation)
  .put(requireWrite("stormwater"), updateViolation)
  .delete(requireWrite("stormwater"), deleteViolation)

export default router