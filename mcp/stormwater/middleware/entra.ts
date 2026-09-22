import jwksClient from "jwks-rsa"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { EntraUser } from "./types"
import logger from "../utils/logger"

// Same Entra ID (Azure AD) validation as `eng-api-ts`'s `@middleware/auth/entra`,
// duplicated here because this is a standalone Node process with its own
// dependency tree, not something that can import across the two package.json's.

export const entra = (req: Request, res: Response, next: NextFunction) => {
  if(process.env.NODE_ENV === "development") {
    const iat = Math.floor(Date.now() / 1000)

    req.entra = {
      aud: "",
      exp: iat + 30 * 24 * 60 * 60,
      iat,
      iss: "",
      name: "",
      nbf: iat,
      oid: "",
      preferred_username: "test.o365-3@franklintn.gov",
      roles: ["stormwater.write"],
      sid: "",
      sub: "",
      tid: "",
      ver: "",
    }

    next()
    return
  }

  if(!req.headers.authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header required" })
    return
  }

  const token = req.headers.authorization.slice("Bearer ".length)

  jwt.verify(token, getKey, {
    audience: process.env.ENTRA_CLIENT_ID,
    issuer: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/v2.0`,
    algorithms: ["RS256"],
  }, (err, decoded) => {
    if(err) {
      logger.error(`[AUTH] token verification error: ${ err.message }`)
      res.status(401).json({ error: "Not authorized to access this route" })
      return
    }

    req.entra = decoded as EntraUser
    next()
  })
}

const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 600000,
})

const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  jwks.getSigningKey(header.kid, (err, key) => {
    if(err) {
      callback(err)
      return
    }
    callback(null, key?.getPublicKey())
  })
}
