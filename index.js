require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const Note = require('./models/note');

// For serving static content
app.use(express.static('build'))

// We have to use this else we woudn'te be able to recieve the object send by user.
app.use(bodyParser.json());

// to prevent CORS error
app.use(cors());

// MIDDLE-WARE 'morgan' used on 'post' method
morgan.token('data', (req, res) => {
  console.log('Morgan', req.body);
  return JSON.stringify(req.body); // will only be displayes as JSON
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :data'));

let notes = [ //let because we are modifying later with DELETE and PUT
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
];


// -- GET -- 

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  // Using mongoose model 'Note' to find notes
  Note.find({})
    .then( (notes) => {
      res.json(notes.map( (note) => note.toJSON()));
    });
});

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then( (note) => {
      if (note) {
        response.json(note.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch( (error) => next(error));
})

//  -- DELETE --
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then( (result) => {
      response.status(204).end();
    })
    .catch( (error) => {
      next(error);
    })
})



// -- POST --

app.post('/api/notes', (request, response, next) => {
  const body = request.body; // this would be undefined without the body-parser modyle.
  
  // if (!body.content) {
  //   return response.status(400).json({
  //     error: 'content missing'
  //   })
  // }

  // note being created from the mongoose model 'Note'
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    // id: generateId(), No need because mongoose creates it automatically!
  });

  // notes = notes.concat(note);
  // response.json(note);

  // saving note to mongodb
  note.save()
    .then( (savedNote) => {
      return savedNote.toJSON();
    })
    .then( (savedAndFormattedNote) => {
      response.json(savedAndFormattedNote);
    })
    .catch( (error) => next(error))
});

// -- PUT --
app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true})
    .then( (updatedNote) => {
      response.json(updatedNote.toJSON())
    })
    .catch( (error) => {
      next(error);
    })
})

// MIDDLE-WARE for Unknown routes
const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: 'unknown endpoint'
  });
}

app.use(unknownEndpoint);


// MIDDLE-WARE for error handling
const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(404).send({ error: 'malformatted id'});
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message});
  }
}

app.use(errorHandler);

// CREATING SERVER

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})