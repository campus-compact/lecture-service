import mongoose from 'mongoose'

await mongoose.connect('mongodb+srv://example:cH8gAiGP00n0tHlf@lecture-service.5f8xy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

export default mongoose