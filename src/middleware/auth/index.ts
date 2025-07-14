import asyncHandler from '../async'
import { ErrorResponse } from '../../utils/errorResponse'

// Types
import { Request, Response, NextFunction } from 'express'
import { EntraUserInterface } from "./types"

export const entra = asyncHandler(async (req: Request, res: Response, next: NextFunction) => { // Validate token from Entra
  const env = process.env.NODE_ENV

  if(env === 'development') { // Development
    const user: EntraUserInterface = {
      aud: '',
      exp: 0,
      iat: 0,
      iss: '',
      name: '',
      nbf: 0,
      nonce: '',
      oid: '',
      preferred_username: 'test.o365-3@franklintn.gov',
      rh: '',
      roles: [],
      sid: '',
      sub: '',
      tid: '',
      uti: '',
      ver: ''
    }

    req.entra = user

    return next()
  }

  if(req.headers.authorization) {
    const headers = new Headers()

    headers.append('Authorization', req.headers.authorization)

    const result = await fetch(`${ process.env.ENTRA_URL }`, { headers })

    if(result.status !== 200) {
      return next(new ErrorResponse('Not authorized to access this route', 401))
    }
    
    const data = await result.json()

    req.entra = data.data

    return next()
  } else return next(new ErrorResponse('Not authorized to access this route', 401))
})