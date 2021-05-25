import mongoose from '../api/mongoose.js'
import lectureSchema from './schemas/lecture.js'

export default mongoose.model('Lecture', lectureSchema)
