import { Router } from 'express'
import { getPetitions, getPetition, createPetition, updatePetition, deletePetition } from '@controllers/traffic-calming/petition'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

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