import express from 'express'
import User from '../models/user.js'

const router = express.Router()

router.get('/', (req, res) => {
  User
    .find()
    .select('-lectures -__v')
    .lean()
    .then(user => user
      ? res.send(user)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

router.get('/:userId/lectures', (req, res) => {
  User
    .findById(req.params.userId) //Todo: falls user.updated < 24 Std --> zurückgeben, sonst Lectureservice kontaktieren
    .select('lectures -_id')
    .populate('lectures', '-__v') // TODO: replace with lookup when performance becomes an issue
    .lean()
    .then(user => user
      ? res.send(user.lectures)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

router.post('/', async (req, res) => {
  const user = new User(req.body)
  user.save()
    .then(user => user
      ? res.status(201).send(user)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

router.put('/:userId', (req, res) => {
  User
    .findByIdAndUpdate(req.params.userId, req.body)
    .lean()
    .then(user => user
      ? res.sendStatus(204)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

router.delete('/:userId', (req, res) => {
  User
    .findByIdAndRemove(req.params.userId)
    .lean()
    .then(user => user
      ? res.sendStatus(204)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

export default router
