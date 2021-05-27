import express from 'express'
import Lecture from '../models/lecture.js'

const router = express.Router()

// router.get('/', (req, res) => {
//   Lecture
//     .find()
//     .select('-__v')
//     .lean()
//     .then(lectures => lectures
//       ? res.send(lectures)
//       : res.sendStatus(404))
//     .catch(err => res.status(500).send(err.message))
// })

// router.get('/:id', (req, res) => {
//   Lecture
//     .findById(req.params.id)
//     .select('-__v')
//     .lean()
//     .then(lecture => lecture
//       ? res.send(lecture)
//       : res.sendStatus(404))
//     .catch(err => res.status(500).send(err.message))
// })

// router.post('/', async (req, res) => {
//   const lecture = new Lecture(req.body)
//   lecture.save()
//     .then(lecture => lecture
//       ? res.status(201).send(lecture)
//       : res.sendStatus(404))
//     .catch(err => res.status(500).send(err.message))
// })

// router.put('/:id', (req, res) => {
//   Lecture
//     .findByIdAndUpdate(req.params.id, req.body)
//     .lean()
//     .then(lecture => lecture
//       ? res.sendStatus(204)
//       : res.sendStatus(404))
//     .catch(err => res.status(500).send(err.message))
// })

// router.delete('/:id', (req, res) => {
//   Lecture
//     .findByIdAndRemove(req.params.id)
//     .lean()
//     .then(lecture => lecture
//       ? res.sendStatus(204)
//       : res.sendStatus(404))
//     .catch(err => res.status(500).send(err.message))
// })

export default router
