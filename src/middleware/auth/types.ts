export interface EntraUserInterface {
  aud: string
  exp: number
  iat: number
  iss: string
  name: string
  nbf: number
  oid: string
  preferred_username: string
  roles: string[]
  scp?: string
  sid: string
  sub: string
  tid: string
  ver: string
}

declare global {
  namespace Express {
    interface Request {
      entra?: EntraUserInterface
    }
  }
}