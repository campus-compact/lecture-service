import express from 'express'
import User from '../models/user.js'
import axios from 'axios'
import keycloak from '../api/keycloak.js'
import config from '../config.js'

const router = express.Router()

function protectByUserId (token, req) {
  return req.params.userId === token.content.preferred_username
}

router.get('/', keycloak.protect(),(req, res) => {
  User
    .find()
    .select('-__v')
    .lean()
    .then(user => user
      ? res.send(user)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

function getLecturesFromCdService (req, res, user) {
  const today = new Date()
  const datediff = Math.abs(user.updated - today)
  const datediffHours = datediff / 1000 / 60 / 60

  // Lectures beim Campusdual-Service aktualisieren, wenn ... Stunden vergangen sind
  if (datediffHours >= config.syncHours) {
    user.lectures = []

    // Authentifizierungstoken wird übergeben
    const token = req.headers.authorization.split(' ')[1]
    const axiosConfig = {
      headers: { Authorization: `Bearer ${token}` }
    }

    // TODO: ersetzen, da künfig Authentifizierungstoken verwendet wird.
    const postBody = {
      username: req.params.userId
    }

    axios.post(`http://${config.campusDualServiceAddr}:${config.campusDualServicePort}/lecture`, postBody, axiosConfig)
      .then((resp1) => {
        const body = resp1.data

        body.forEach(element => {
          const object = {
            rooms: [element.room],
            instructors: [element.instructor],
            title: element.title,
            start: element.start,
            end: element.end,
            allDay: element.allDay,
            description: element.description,
            color: element.color,
            editable: element.editable
          }

          user.lectures.push(object)
        })

        user.updated = new Date()

        User
          .findByIdAndUpdate(req.params.userId, user)
          .lean()
          .then(u => {
            // Lectures zu einem User zurückgeben
            User
              .findById(req.params.userId)
              .select('lectures -_id')
              .lean()
              .then(user => user
                ? res.send(user.lectures)
                : res.sendStatus(404))
              .catch(err => res.status(500).send(err.message))
          })
      })
      .catch(err => res.status(500).send(`Fehler beim Aufruf von POST bei |http://${config.campusDualServiceAddr}:${config.campusDualServicePort}/lecture| mit folgendem Body: |${JSON.stringify(postBody)}| Meldung: ${err.message}`) )
  } else {
    User
      .findById(req.params.userId)
      .select('lectures -_id')
      .lean()
      .then(user => user
        ? res.send(user.lectures)
        : res.sendStatus(404))
      .catch(err => res.status(500).send(err.message))
  }
}

router.get('/:userId/lectures', keycloak.protect(protectByUserId), (req, res) => {
  User
    .findById(req.params.userId)
    .then(user => {
      if (user === null) {
        // wenn Nutzer noch nicht existiert wird dieser angelegt
        // Datum 1999: bewirkt, dass Lectures geladen werden.
        const userInsertObj = { _id: req.params.userId, lectures: [], updated: new Date('1999-05-20 01:00') }
        const userInsert = new User(userInsertObj)
        userInsert.save()
          .then(userInsert => userInsert
            ? getLecturesFromCdService(req, res, userInsert)
            : res.sendStatus(404))
          .catch(err => res.status(500).send('Der gewünschte Nutzer existiert nicht. ' + err.message))
      } else {
        getLecturesFromCdService(req, res, user)
      }
    })
    .catch(err => res.status(500).send(err.message))
})

router.post('/', keycloak.protect(protectByUserId), async (req, res) => {
  const user = new User(req.body)
  user.save()
    .then(user => user
      ? res.status(201).send(user)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

router.put('/:userId', keycloak.protect(protectByUserId), (req, res) => {
  User
    .findByIdAndUpdate(req.params.userId, req.body)
    .lean()
    .then(user => user
      ? res.sendStatus(204)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

router.delete('/:userId', keycloak.protect(protectByUserId), (req, res) => {
  User
    .findByIdAndRemove(req.params.userId)
    .lean()
    .then(user => user
      ? res.sendStatus(204)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

export default router
