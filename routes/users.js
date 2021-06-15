import express from 'express'
import User from '../models/user.js'
import axios from 'axios'
import keycloak from '../api/keycloak.js'
import config from '../config.js'

const router = express.Router()

/**
 * Helper to ensure the requests userId matches the tokens preferred_username.
 * @param token
 * @param req
 * @returns {boolean}
 */
function protectByUserId (token, req) {
  return req.params.userId === token.content.username
}

/**
 * Map lectures from campus dual format to the format of our lecture schema
 * @param lecture
 * @returns {{allDay, rooms: *[], color, editable, start, description: string, end, title, instructors: *[]}}
 */
function mapLecture (lecture) {
  return {
    rooms: [...new Set([lecture.room, lecture.sroom])],
    instructors: [...new Set([lecture.instructor, lecture.sinstructor])],
    title: lecture.title,
    start: lecture.start,
    end: lecture.end,
    allDay: lecture.allDay,
    description: [...new Set([lecture.description, lecture.remarks])].join(', '),
    color: lecture.color,
    editable: lecture.editable
  }
}

/**
 * @swagger
 * /users/:
 *   get:
 *     security:
 *      - Bearer: []
 *     summary: Administratoren können alle Nutzer und Lectures abrufen
 *     responses:
 *       "200":
 *         description: Erfolgreich
 *       "404":
 *         description: Fehler/Nicht gefunden
 *       "403":
 *         description: Access denied
 */
router.get('/', keycloak.protect('realm:admin'), async (req, res) => {
  const user = await User.find().select('-__v').lean()
  user ? res.json(user) : res.sendStatus(404)
})

/**
 * @swagger
 * /users/{userId}/lectures:
 *   get:
 *     security:
 *      - Bearer: []
 *     summary: Alle Vorlesungen zu einem Benutzer werden ausgegeben
 *     responses:
 *       "200":
 *         description: Erfolgreich - gibt Array aller Vorlesungen zurück
 *       "500":
 *         description: Fehler
 *       "403":
 *         description: Access denied
 */
router.get('/:userId/lectures', keycloak.protect(protectByUserId), async (req, res, next) => {
  let user = await User.findById(req.params.userId)

  if (user === null) {
    user = await User.create({ _id: req.params.userId })
  }

  const now = new Date()
  if (user.lectures.length === 0 || (now - user.updatedAt) / 1000 / 60 > config.syncMinutes) {
    // User was last updated more than config.syncMinutes ago. Get fresh lectures!
    const url = `http://${config.campusDualServiceAddr}:${config.campusDualServicePort}/lectures/${req.params.userId}`
    const response = await axios.get(url, { headers: { Authorization: req.headers.authorization } })
    if (response.status !== 200) {
      return next(new Error(`Requesting new lectures failed with status ${response.status}\n${response.data}`))
    }
    user.lectures = response.data.map(mapLecture)
    await user.save()
  }

  res.json(user.lectures)
})

/**
 * @swagger
 * /users/:
 *   post:
 *     security:
 *      - Bearer: []
 *     summary: neuen Benuzter anlegen, nur für administrative Benutzer
 *     responses:
 *       "201":
 *         description: Erfolgreich
 *       "500":
 *         description: Fehler
 *       "403":
 *         description: Access denied
 */
router.post('/', keycloak.protect('realm:admin'), async (req, res) => {
  const user = await User.create(req.body)
  res.status(201).json(user)
})

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     security:
 *      - Bearer: []
 *     summary: bestehenden Benuzter bearbeiten, nur für administrative Benutzer
 *     responses:
 *       "204":
 *         description: Erfolgreich bearbeitet
 *       "404":
 *         description: Fehler
 *       "403":
 *         description: Access denied
 */
router.put('/:userId', keycloak.protect('realm:admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, req.body).lean()
  user ? res.sendStatus(204) : res.sendStatus(404)
})

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     security:
 *      - Bearer: []
 *     summary: Benutzer löschen (jeweils durch eigenen Benutzer)
 *     responses:
 *       "204":
 *         description: Benutzer gelöscht
 *       "404":
 *         description: Fehler
 *       "403":
 *         description: Access denied
 */
router.delete('/:userId', keycloak.protect(protectByUserId), async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.userId).lean()
  user ? res.sendStatus(204) : res.sendStatus(404)
})

export default router