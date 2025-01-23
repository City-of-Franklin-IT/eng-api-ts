import express from 'express'
import { createVestingExtension, updateVestingExtension, deleteVestingExtension } from '@controllers/vesting/vestingExtension'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createVestingExtension)

router
  .route('/:uuid')
  .put(updateVestingExtension)
  .delete(deleteVestingExtension)

export default router