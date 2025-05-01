// Types
import { Request } from "express"

export default (req: Request): { updatedBy: string, createdBy?: string } => {
  const method = req.method

  const email = req.entra?.preferred_username as string

  return method === 'POST' ? { createdBy: email, updatedBy: email } : { updatedBy: email }
}