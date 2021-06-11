import express from 'express'
import usersRouter from './users.js'
import keycloak from '../api/keycloak.js'


const router = express.Router()

router.use('/users', keycloak.middleware(), usersRouter)

export default router
