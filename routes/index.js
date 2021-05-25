import express from 'express'
import auth from '../middlewares/auth.js'
import lecturesRouter from './lectures.js'
import usersRouter from './users.js'

const router = express.Router()

router.use('/lectures', auth, lecturesRouter)
router.use('/users', auth, usersRouter)

export default router
