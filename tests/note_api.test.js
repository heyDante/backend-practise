const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Note = require('../models/note');
const helper = require('../utils/test_helper');

/* -- Supertest wraps the app component, and we also don't have to define the port, it does
it on its behalf -- */
const api = supertest(app);

beforeEach(async () => {
  await Note.deleteMany({});

  // let noteObject = new Note(helper.initialNotes[0]);
  // await noteObject.save();

  // noteObject = new Note(helper.initialNotes[1]);
  // await noteObject.save();
  helper.initialNotes.forEach(async (note) => {
    let noteObject = new Note(note);
    await noteObject.save();
    console.log('saved');
  });
  console.log('done');
});

test('notes are returned as JSON', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all notes are returned', async () => {
  const response = await api.get('/api/notes');
  expect(response.body.length).toBe(helper.initialNotes.length);
});


test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');
  expect(response.body[0].content).toBe('HTML is easy');
});


test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes');
  const contents = response.body.map((r) => r.content);

  expect(contents).toContain('Browser can execute only Javascript');
});


test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd.length).toBe(helper.initialNotes.length + 1);

  const contents = notesAtEnd.map((note) => note.content);
  expect(contents).toContain(
    'async/await simplifies making async calls'
  );
});


test('note without content is not added', async () => {
  const newNote = {
    important: true
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd.length).toBe(notesAtEnd.length);
});


test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)  // internal methods of the supertest wrapped functionality
    .expect('Content-Type', /application\/json/);

  expect(resultNote.body).toEqual(noteToView);
});


test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204);

  const notesAtEnd = await helper.notesInDb();

  expect(notesAtEnd.length).toBe(helper.initialNotes.length - 1);
});

afterAll(() => {
  mongoose.connection.close();
});