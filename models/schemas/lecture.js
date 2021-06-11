import mongoose from '../../api/mongoose.js'

export default new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true, get: start => Math.round(start.getTime()) },
  end: { type: Date, required: true, get: end => Math.round(end.getTime())},
  allDay: { type: Boolean, required: true },
  description: { type: String },
  color: { type: String, required: true },
  editable: { type: Boolean, required: true },
  rooms: { type: [String], required: true },
  instructors: { type: [String], required: true }
}, { toJSON: { getters: true } })
