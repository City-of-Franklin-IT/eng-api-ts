import asyncHandler from '../async'
import { ErrorResponse } from '../../utils/errorResponse'
import jwksClient from 'jwks-rsa'
import jwt from 'jsonwebtoken'
import logger from '../../utils/logger'

// Types
import { Request, Response, NextFunction } from 'express'
import { UserInterface, EntraUserInterface } from "./types"

const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 600000
})

const getKey = (header: any, callback: any) => {
  try {
    logger.debug(`[AUTH] getKey called, kid: ${header?.kid}`)
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) {
        logger.error(`[AUTH] getSigningKey error: ${err.message}`)
        callback(err)
      } else {
        logger.debug('[AUTH] Signing key found')
        const signingKey = key?.getPublicKey()
        callback(null, signingKey)
      }
    })
  } catch (err) {
    logger.error(`[AUTH] getKey exception: ${err}`)
    callback(err)
  }
}

export const entra = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const env = process.env.NODE_ENV

  if(env === 'development') {
    const today = new Date()

    const user: UserInterface = {
      role: 'Super User',
      department: 'IT',
      email: 'test.o365-3@franklintn.gov',
      iat: Math.floor(today.getTime() / 1000),
      exp: Math.floor(today.getTime() / 1000) + (30 * 24 * 60 * 60)
    }

    req.user = user

    return next()
  }

  if(!req.headers.authorization?.startsWith('Bearer ')) {
    return next(new ErrorResponse('Authorization header required', 401))
  }

  const token = req.headers.authorization.slice('Bearer '.length)

  jwt.verify(token, getKey, {
    audience: process.env.ENTRA_CLIENT_ID,
    issuer: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/v2.0`
  }, (err, decoded) => {
    if(err) {
      logger.error(`[AUTH] token verification error: ${err.message}`)
      return next(new ErrorResponse('Not authorized to access this route', 401))
    }

    req.entra = decoded as EntraUserInterface

    return next()
  })
})