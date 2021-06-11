import express from 'express'
import indexRoute from './routes/index.js'
import keycloak from './api/keycloak.js'
import config from './config.js'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const app = express()

// Access body as JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

//Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lecture-Service API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: ["./routes/users.js"],
};

const specs = swaggerJsdoc(options);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));


