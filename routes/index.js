import express from 'express'
import lecturesRouter from './lectures.js'
import usersRouter from './users.js'
import keycloak from '../api/keycloak.js'
import jwt_decode from 'jwt-decode'

const router = express.Router()

// router.use('/lectures', keycloak.protect(protectByUserId), lecturesRouter)
router.use('/users', keycloak.protect(protectByUserId), usersRouter)

function protectByUserId (token, req) {
  // verweigert Zugriff, wenn Benutzer aus Keycloak abweichend zur API-Anfrage

  // Username aus JSON Web Token
  const userInToken = (jwt_decode(token.token)).preferred_username

  // Username aus Request
  const userInRequest = (req.url).split('/')[1]

  if (userInToken.toLowerCase() == userInRequest.toLowerCase()) {
    return true
  } else {
    return false
  }
}

export default router
