import dotenv from 'dotenv'
dotenv.config({ path: 'src/config/config.env' })

import express from 'express'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import errorHandler from './middleware/errorHandler'
import csp from './middleware/csp'
import inputSanitation from './middleware/inputSanitation'

const app = express()

app.use(express.json()) // Request body parser
app.use(helmet())
app.use(hpp())
app.use(csp) // Content security policy
app.use(inputSanitation) // Input sanitation
app.use(cors({ origin: ['https://dev.franklintn.gov', 'https://apps.franklintn.gov', 'http://cofasv38'] })) // CORS

// Route files
import milestone from '@routes/cip/milestone'
import phase from '@routes/cip/phase'
import project from '@routes/cip/project'
import spending from '@routes/cip/spending'
import update from '@routes/cip/update'
import publicRoutes from '@routes/public'

// Mount routes
app.use('/api/v1/eng/cip/milestone', milestone)
app.use('/api/v1/eng/cip/phase', phase)
app.use('/api/v1/eng/cip/project', project)
app.use('/api/v1/eng/cip/spending', spending)
app.use('/api/v1/eng/cip/update', update)
app.use('/api/v1/eng/cip/public', publicRoutes)

app.use(errorHandler)

const port = process.env.PORT || 5000

app.set('port', port)

app.listen({ port }, async () => {
  console.log(`Server up on ${ process.env.HOST }:${ port } in ${ process.env.NODE_ENV } mode..`)
})
