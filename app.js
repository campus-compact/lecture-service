import express from 'express'
import indexRoute from './routes/index.js'
import keycloak from './api/keycloak.js'

const app = express()

const port = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'
console.log(`LectureService is starting in a ${isProduction ? 'production' : 'development'} environment.`)

// Access body as JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Require Routes
app.use(indexRoute)

// Actually start listening
app.listen(port, () => {
  console.log(`Setup completed: Express is listening on port ${port}`)
})

//Keycloak
app.use(keycloak.middleware());
