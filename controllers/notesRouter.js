/* -- notesRouter variable gets all the Router functionalities of express -- */
const notesRouter = require('express').Router(); 
const jwt = require('jsonwebtoken');


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
const getTokenFrom = (req) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

notesRouter.post('/', async (request, response, next) => {
  const body = request.body; // this would be undefined without the body-parser module.

  const token = getTokenFrom(request);

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if(!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid'});
    }
    const user = await User.findById(decodedToken.id);

    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
      user: user._id
    });

    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    response.json(savedNote.toJSON());
  } catch (exception) {
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