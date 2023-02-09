const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./public/assets/helpers/uuid');


const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


app.get('/notes', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
   fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedNotes = JSON.parse(data);
        res.json(parsedNotes)
      }})
});

app.post('/api/notes', (req, res) => {

  const { title, text} = req.body;

  if (title && text) {

    const newNote = {
      title,
      text,
      id: uuid(),
    };


    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {

        const parsedNotes = JSON.parse(data);

        parsedNotes.push(newNote);

        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNotes, null, 2),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully added note.')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting note');
  }
});

app.delete('/api/notes/:id', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
     if (err) {
       console.error(err);
     } else {
       const parsedNotes = JSON.parse(data);
       const newArr = removeObjectWithId(parsedNotes, req.params.id);
       fs.writeFile(
        './db/db.json',
        JSON.stringify(newArr, null, 2),
        (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info('Successfully added note.')
      );

       res.json(newArr)
     }})
});

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);

function removeObjectWithId(arr, id) {
  return arr.filter((obj) => obj.id !== id);
}

