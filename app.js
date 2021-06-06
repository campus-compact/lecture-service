import express from 'express'
import indexRoute from './routes/index.js'
import keycloak from './api/keycloak.js'
import config from './config.js'

const app = express()

const isProduction = process.env.NODE_ENV === 'production'
console.log(`LectureService is starting in a ${isProduction ? 'production' : 'development'} environment.`)

// Access body as JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Keycloak
app.use(keycloak.middleware())

// Require Routes
app.use(indexRoute)

// Actually start listening
app.listen(config.port, () => {
  console.log(`Setup completed: Express is listening on port ${config.port}`)
})
