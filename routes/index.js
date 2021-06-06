import express from 'express'
import lecturesRouter from './lectures.js'
import usersRouter from './users.js'

const router = express.Router()

// router.use('/lectures', keycloak.protect(protectByUserId), lecturesRouter)
router.use('/users', usersRouter)

export default router
