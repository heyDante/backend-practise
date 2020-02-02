const express = require('express');
const bodyParser = require('body-parser');
const app = express(); // intializing express library
const cors = require('cors');
const mongoose = require('mongoose');

const config = require('./utils/config');
const notesRouter = require('./controllers/notes');
const middleware = require('./utils/middleware');


console.log('connecting to MongoDB Atlas..');

/* -- Actual connection to MongoDB Atlas. Shoulde be defined earlier than the mongoose models -- */
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then( () => {
    console.log('connected to MongoDB');
  })
  .catch( (error) => {
    console.log('error connecting to MongoDB:', error.message);
  });


app.use(cors()); // To prevent CORS error
app.use(express.static('build')); // For serving static content
app.use(bodyParser.json()); // We have to use this else we woudn'te be able to recieve the object send by user.
app.use(middleware.requestLogger);

app.use('/api/notes', notesRouter); // Use 'notesRouter' to handle all routes for 'api/notes'. Inside notesRouter is our model functionality

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;