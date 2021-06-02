import express from 'express'
import auth from '../middlewares/auth.js'
import lecturesRouter from './lectures.js'
import usersRouter from './users.js'
import keycloak from '../api/keycloak.js'

const router = express.Router()

router.use('/lectures', keycloak.protect(), lecturesRouter)
router.use('/users', keycloak.protect(), usersRouter)

export default router
