import { Router } from 'express'
import { createVestingPeriod, updatePeriod, deleteVestingPeriod, updateVestingStatus } from '@controllers/vesting/vestingPeriod'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(createVestingPeriod)

router
  .route('/:uuid')
  .put(updatePeriod)
  .delete(deleteVestingPeriod)

router
  .route('/status/:uuid')
  .put(updateVestingStatus)

export default router