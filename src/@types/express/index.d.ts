// Types
import { FileInterface } from '@models/stormwater/types'
import { EntraUserInterface } from '@middleware/auth/types'

declare global {
  namespace Express {
    interface Request {
      entra?: EntraUserInterface
      file?: FileInterface
    }
  }
}

export {}