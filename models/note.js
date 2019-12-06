const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

const url = process.env.MONGODB_URI;


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then( (result) => {
    console.log('connected to MongoDB');
  })
  .catch( (error) => {
    console.log('error connecting to MongoDB: ', error.message);
  })

  const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  });

  noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
  })

  // Export this module
  module.exports = mongoose.model('Note', noteSchema);
