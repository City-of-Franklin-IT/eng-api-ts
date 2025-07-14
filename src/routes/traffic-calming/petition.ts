import { Router } from 'express'
import { getPetitions, getPetition, createPetition, updatePetition, deletePetition } from '@controllers/traffic-calming/petition'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getPetitions)
  .post(createPetition)

router
  .route('/:uuid')
  .get(getPetition)
  .put(updatePetition)
  .delete(deletePetition)

export default router