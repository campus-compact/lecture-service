import mongoose from '../../api/mongoose.js'
import Lecture from './lecture.js'

export default new mongoose.Schema({
  _id: { type: String, required: true },
  lectures: { type: [mongoose.Schema.Types.ObjectId], ref: 'Lecture', required: true },
  updated: { type: Date, default: Date.now },
})

