import express from 'express'
import User from '../models/user.js'
import axios from 'axios'
import jwt_decode  from 'jwt-decode'

const router = express.Router();

const addr = process.env.CAMPUS_DUAL_SERVICE_ADDR || "127.0.0.1"
const port = process.env.CAMPUS_DUAL_SERVICE_PORT || 4321
const syncHours = process.env.CAMPUS_DUAL_SERVICE_SYNCHOURS || 24

router.get('/', (req, res) => {
  User
    .find()
    .select('-__v')
    .lean()
    .then(user => user
      ? res.send(user)
      : res.sendStatus(404))
    .catch(err => res.status(500).send(err.message))
})

function getLecturesFromCdService(req,res,user) {
      const today = new Date();
      const datediff = Math.abs(user.updated - today)
      const datediffHours = datediff/1000/60/60;

      //Lectures beim Campusdual-Service aktualisieren, wenn ... Stunden vergangen sind
      if(datediffHours >= syncHours) {

        user.lectures = [];

        //Authentifizierungstoken wird übergeben
        const token = req.headers.authorization.split(' ')[1];
        const config = {
          headers: {Authorization: `Bearer ${token}`}
        }

        //TODO: ersetzen, da künfig Authentifizierungstoken verwendet wird.
        const postBody = {
          username: req.params.userId,
          hash: "adc3486f70b23c8841d950a15fd5e947",
          start: 1622066400,
          end: 1622152800
        }

        axios.post(`http://${addr}:${port}/lecture`,postBody,config)
          .then((resp1) => {

            const body = resp1.data;

            body.forEach(element => {

                  const object = {
                    "rooms": [element.room],
                    "instructors": [element.instructor],
                    "title": element.title,
                    "start": element.start,
                    "end": element.end,
                    "allDay": element.allDay,
                    "description": element.description,
                    "color": element.color,
                    "editable": element.editable
                  }
                  
                  user.lectures.push(object);
                });
      
                user.updated = new Date();
      
                User
                .findByIdAndUpdate(req.params.userId,user)
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
          .catch(err => res.status(500).send(`Fehler beim Aufruf von POST bei |http://${addr}:${port}/lecture| mit folgendem Body: |${JSON.stringify(postBody)}| Meldung: ${err.message}`));

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

router.get('/:userId/lectures', (req, res) => {
  User
    .findById(req.params.userId)
    .then(user => {

      if(user === null) {
        // wenn Nutzer noch nicht existiert wird dieser angelegt
        //Datum 1999: bewirkt, dass Lectures geladen werden.
        const userInsertObj = {_id: req.params.userId, lectures: [], updated: new Date('1999-05-20 01:00')}
        const userInsert = new User(userInsertObj)
        userInsert.save()
          .then(userInsert => userInsert
            ? getLecturesFromCdService(req,res,userInsert)
            : res.sendStatus(404))
          .catch(err => res.status(500).send("Der gewünschte Nutzer existiert nicht. "+err.message))
      } else {
        getLecturesFromCdService(req,res,user);
      }
    })
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
