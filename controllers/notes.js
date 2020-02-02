/* -- notesRouter variable gets all the Router functionalities of express -- */
const notesRouter = require('express').Router(); 


/* -- The actual Mongoose Model required for querying the database -- */
const Note = require('../models/note'); 

/* -- GET -- */
notesRouter.get('/', async (req, res) => {
  // Using mongoose model 'Note' to find notes
  const notes = await Note.find({});
  res.json(notes.map((note) => note.toJSON()));
});

notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then( (note) => {
      if (note) {
        response.json(note.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch( (error) => next(error));
});


/* -- POST -- */
notesRouter.post('/', (request, response, next) => {
  const body = request.body; // this would be undefined without the body-parser modyle.
  
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    });
  }

  // note being created from the mongoose model 'Note'
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });

  // saving note to mongodb atlas
  note.save()
    .then( (savedNote) => {
      return savedNote.toJSON();
    })
    .then( (savedAndFormattedNote) => {
      response.status(201).json(savedAndFormattedNote);
    })
    .catch( (error) => next(error));
});

/* -- DELETE -- */
notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then( (result) => {
      response.status(204).end();
    })
    .catch( (error) => {
      next(error);
    });
});

/* -- PUT -- */
notesRouter.put('/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true})
    .then( (updatedNote) => {
      response.json(updatedNote.toJSON());
    })
    .catch( (error) => {
      next(error);
    });
});

module.exports = notesRouter;