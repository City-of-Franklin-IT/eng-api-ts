import { Router } from 'express'
import { createGreenInfrastructure, getGreenInfrastructures, getGreenInfrastructure, updateGreenInfrastructure, deleteGreenInfrastructure } from '@controllers/stormwater/greenInfrastructure'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getGreenInfrastructures)
  .post(createGreenInfrastructure)

router
  .route('/:uuid')
  .get(getGreenInfrastructure)
  .put(updateGreenInfrastructure)
  .delete(deleteGreenInfrastructure)

export default router