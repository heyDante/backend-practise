const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://heyDante:${password}@cluster0-4riut.mongodb.net/note-app?retryWrites=true&w=majority`;

// Establishing conncetion to the database. If not found, mongodbatlas automatically creates a new one
mongoose.connect(url, { useNewUrlParser: true });

// Schema
const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
});


// Model
const Note = mongoose.model('Note', noteSchema);


// Generating note
// const note = new Note({
//   content: 'GET and POST are the most important methods of HTTP protocol',
//   date: new Date(),
//   important: false,
// });

// note.save()
//   .then( (response) => {
//     console.log('note saved!');
//     console.log(response);
//     mongoose.connection.close();
// });


// Fetching Note
Note.find({})
  .then( (result) => {
    result.forEach( note => {
      console.log(note);
    });
    mongoose.connection.close();
  })