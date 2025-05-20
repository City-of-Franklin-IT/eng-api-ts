import { Router } from 'express'
import { createVestingPeriod, updateVestingPeriod, deleteVestingPeriod, updateVestingStatus } from '@controllers/vesting/vestingPeriod'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createVestingPeriod)

router
  .route('/:uuid')
  .put(updateVestingPeriod)
  .delete(deleteVestingPeriod)

router
  .route('/status/:uuid')
  .put(updateVestingStatus)

export default router