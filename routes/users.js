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
  return req.params.userId === token.content.preferred_username
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

router.get('/', keycloak.protect('realm:admin'), async (req, res) => {
  const user = await User.find().select('-__v').lean()
  user ? res.json(user) : res.sendStatus(404)
})

router.get('/:userId/lectures', keycloak.protect(protectByUserId), async (req, res, next) => {
  let user = await User.findById(req.params.userId)

  if (user === null) {
    user = await User.create({ _id: req.params.userId })
  }

  const now = new Date()
  if (user.lectures.length === 0 || (now - user.updatedAt) / 1000 / 60 > config.syncMinutes) {
    // User was last updated more than config.syncMinutes ago. Get fresh lectures!
    const postUrl = `http://${config.campusDualServiceAddr}:${config.campusDualServicePort}/lecture`
    const postBody = { username: req.params.userId }
    const postConfig = { headers: { Authorization: req.headers.authorization } }
    const response = await axios.post(postUrl, postBody, postConfig)
    if (response.status !== 200) {
      return next(new Error(`Requesting new lectures failed with status ${response.status}\n${response.data}`))
    }
    user.lectures = response.data.map(mapLecture)
    await user.save()
  }

  res.json(user.lectures)
})

router.post('/', keycloak.protect('realm:admin'), async (req, res) => {
  const user = await User.create(req.body)
  res.status(201).json(user)
})

router.put('/:userId', keycloak.protect('realm:admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, req.body).lean()
  user ? res.sendStatus(204) : res.sendStatus(404)
})

router.delete('/:userId', keycloak.protect(protectByUserId), async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.userId).lean()
  user ? res.sendStatus(204) : res.sendStatus(404)
})

export default router
