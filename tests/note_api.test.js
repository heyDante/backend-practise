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

  const noteObjects = helper.initialNotes.map((note) => new Note(note));
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
});

describe('when there is initially some notes saved', () => {

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

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');
    const contents = response.body.map((r) => r.content);
  
    expect(contents).toContain('Browser can execute only Javascript');
  });
  
  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb();
    
      const noteToView = notesAtStart[0];
    
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)  // internal methods of the supertest wrapped functionality
        .expect('Content-Type', /application\/json/);
    
      expect(resultNote.body).toEqual(noteToView);
    });

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonExistingId = helper.nonExistingId();

      console.log(validNonExistingId);

      await api
        .get(`/api/notes${validNonExistingId}`)
        .expect(404);
    });

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445';

      await api
        .get(`/api/notes/${invalidId}`)
        .expect(400);
    });
  });

  describe('addition of new note', () => {
    test('succeeds with a valid data', async () => {
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

    test('fails with status code 400 if data is invalid', async () => {
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
  });

  describe('deletion of a note', () => {
    test('succeeds with status 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[0];
    
      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204);
    
      const notesAtEnd = await helper.notesInDb();
    
      expect(notesAtEnd.length).toBe(helper.initialNotes.length - 1);
    });
  });
});


afterAll(() => {
  mongoose.connection.close();
});