import express from 'express'
import indexRoute from './routes/index.js'
import keycloak from './api/keycloak.js'
import config from './config.js'

const app = express()

// Access body as JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Use keycloak middlewares
app.use(keycloak.middleware())

// Use the actual routs we define
app.use(indexRoute)

// Basic error handling
app.use((err, req, res, next) => {
  console.log(err)
  res.sendStatus(500)
})

// Start listening
app.listen(config.port, () => {
  console.log(`Setup completed: Express is listening on port ${config.port}`)
})
