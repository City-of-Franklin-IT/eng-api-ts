import { ErrorResponse } from '../errorResponse'

// Types
import { Request, Response, NextFunction } from 'express'

type AppTypes = 
  | "cip"
  | "stormwater"
  | "vesting"
  | "traffic-calming"

const writeRoles: Record<AppTypes, string[]> = {
  "cip": ["cip.write"],
  "stormwater": ["stormwater.write"],
  "vesting": ["vesting.write"],
  "traffic-calming": ["traffic-calming.write"]
}

// Apply to every create, update, or delete route - these always require at least one write role
export const requireWrite = (app: AppTypes) => (req: Request, _res: Response, next: NextFunction) => {
  const roles = req.entra?.roles ?? []

  const targets = writeRoles[app]

  if(!targets.some(role => roles.includes(role))) {
    return next(new ErrorResponse('Insufficient role to access this route', 403))
  }

  return next()
}