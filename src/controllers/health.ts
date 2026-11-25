import { Request, Response } from 'express'
import { Inspector } from '@models/stormwater'
import logger from '@utils/logger'

// @desc    Health check (verifies DB connectivity)
// @route   GET /health
// @access  Public
export const getHealth = async (_req: Request, res: Response) => {
  try {
    await Inspector.findOne({ attributes: ['inspectorId'], raw: true })
    res.status(200).json({ status: 'ok' })
  } catch (err) {
    logger.error({ err }, 'Health check failed: database unreachable')
    res.status(503).json({ status: 'error' })
  }
}
