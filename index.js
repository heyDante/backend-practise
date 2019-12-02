const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// For serving static content
app.use(express.static('build'))

// to prevent CORS error
app.use(cors());

// morgan
morgan.token('data', (req, res) => {
  console.log('Morgan', req.body);
  return JSON.stringify(req.body);
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

app.get('/notes', (req, res) => {
  res.json(notes)
})

app.get('/notes/:id', (request, response) => {
  const id = Number(request.params.id); // what we got was string
  const note = notes.find(note => note.id === id) // if no note is found, we get undefined

  if (note) {
    response.json(note); 
  } else {
    response.status(404).end()
  }
})

//  -- DELETE --
app.delete('/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter(note => note.id !== id)
  response.status(204).end();
})

//  -- POST --

// We have to use this else we woudn'te be able to recieve the object send by user.
app.use(bodyParser.json());

// // morgan
// morgan.token('data', (req, res) => {
//   console.log('Morgan', req.body);
//   return JSON.stringify(req.body);
// });

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map( (n => n.id) )) //notes.map returns an array with all the ids, then we extract the values using the spread operator.
    : 0;

  return maxId + 1;
}

app.post('/notes', (request, response) => {
  const body = request.body; // this would be undefined without the body-parser modyle.
  
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note);

  response.json(note);
 
})

// MIDDLE-WARE
const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: 'unknown endpoint'
  });
}

app.use(unknownEndpoint)



// CREATING SERVER

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})