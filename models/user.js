import mongoose from '../api/mongoose.js'
import userSchema from './schemas/user.js'

export default mongoose.model('User', userSchema)
