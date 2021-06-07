import mongoose from '../../api/mongoose.js'

export default new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, required: true },
  description: { type: String },
  color: { type: String, required: true },
  editable: { type: Boolean, required: true },
  rooms: { type: [String], required: true },
  instructors: { type: [String], required: true }
})
