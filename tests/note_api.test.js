const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

/* -- Supertest wraps the app component, and we also don't have to define the port, it does
it on its behalf -- */
const api = supertest(app);

test('notes are returned as JSON', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('there are four notes', async () => {
  const response = await api.get('/api/notes');
  expect(response.body.length).toBe(4);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');
  expect(response.body[0].content).toBe('HTML is easy');
});

afterAll(() => {
  mongoose.connection.close();
});