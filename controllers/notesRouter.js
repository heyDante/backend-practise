/* -- notesRouter variable gets all the Router functionalities of express -- */
const notesRouter = require('express').Router(); 


/* -- The actual Mongoose Model required for querying the database -- */
const Note = require('../models/note'); 
const User = require('../models/user');

/* -- GET -- */
notesRouter.get('/', async (req, res) => {
  // Using mongoose model 'Note' to find notes
  const notes = await Note.find({})
    .populate('user', {username: 1, name: 1});
  res.json(notes.map((note) => note.toJSON()));
});

notesRouter.get('/:id', async (request, response, next) => {
  try {
    const note = await Note.findById(request.params.id);
    if (note) {
      response.json(note.toJSON());
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});


/* -- POST -- */
notesRouter.post('/', async (request, response, next) => {
  const body = request.body; // this would be undefined without the body-parser module.

  const user = await User.findById(body.userId);
  console.log(user);

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
    user: user._id
  });

  // saving note to mongodb atlas
  try {
    const savedNote = await note.save();
    /* -- Adding note details in user -- */
    user.notes = user.notes.concat(savedNote._id); // Adding the saved notes details to the user model, in the notes property.(array of objects)
    await user.save();
    /* -- Adding note details in user -- */
    response.status(201).json(savedNote.toJSON());
  } catch(exception) {
    next(exception);
  }
});

/* -- DELETE -- */
notesRouter.delete('/:id', async (request, response, next) => {
  try {
    await Note.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
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