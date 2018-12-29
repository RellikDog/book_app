'use strict';

//Application Dependencies

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
require('dotenv').config();
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); //to allow for CSS to work correctly; from stack overflow

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

//postgress setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));



app.get('/', home);

app.post('/searches', search);

function home(req, res){
  res.render('pages/index');
}

function search(req, res){
  const searchStr = req.body.search[0];
  const searchType = req.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (searchType === 'title') url+= `+intitle:${searchStr}`;
  else if (searchType === 'author') url+= `+inauthor:$${searchStr}`;

  return superagent.get(url)
    .then(result => {
      let books = result.body.items.map(book => new Book(book));
      res.render('pages/searches/show', {books});
      console.log(books[0]);
      let SQL = `INSERT INTO books 
            (title, author, descript, image_url, isbn, bookshelf)
            VALUES ($1, $2, $3, $4, $5, $6)`;
      let values = books[0];
      return client.query(SQL, [values.title, values.author, values.descript, values.image, values.isbn, values.bookshelf]);
    }).catch(err => {
      res.render('pages/error', {err});
    });
}

//Constructor Functions
function Book(book, bookshelf){
  // console.log(book)
  this.title = book.volumeInfo.title || 'Book Title does not exist';
  this.author = book.volumeInfo.authors || 'Unknown Author';
  this.descript = book.volumeInfo.description;
  this.image = book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.isbn = book.volumeInfo.industryIdentifiers[0].type + ' ' + book.volumeInfo.industryIdentifiers[0].identifier;
  this.bookshelf = bookshelf;
}


app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));
