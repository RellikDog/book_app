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
app.get('/new', newSearch);
app.get('/books/:id', detailView);

app.post('/searches', search);

function home(req, res){
  const SQL = 'SELECT * FROM books';

  return client.query(SQL)
    .then(data => {
      // console.log(data.rows);
      let books = data.rows.map(book => new DBBook(book));
      console.log(books[0]);
      res.render('pages/index', {books});
    }).catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
}

function newSearch(req, res){
  res.render('pages/searches/new');
}

function detailView(req, res){
  const SQL = `SELECT * FROM books WHERE id=$1;`;
  let values = [req.params.id];
  console.log(req)
  //get bookshelves.then
  client.query(SQL, values)
    .then(data => {
      res.render('pages/books/detail', {book: data.rows[0]});
    }).catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
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
function DBBook(book){
  this.title = book.title || 'Book Title does not exist';
  this.author = book.author || 'Unknown Author';
  this.descript = book.descript;
  this.image = book.image_url || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.isbn = book.isbn;
  this.bookshelf = book.bookshelf;
  this.id = book.id;
}

function Book(book, bookshelf){
  console.log(book)
  this.title = book.volumeInfo.title || 'Book Title does not exist';
  this.author = book.volumeInfo.authors || 'Unknown Author';
  this.descript = book.volumeInfo.description;
  this.image = book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.isbn = book.volumeInfo.industryIdentifiers[0].type + ' ' + book.volumeInfo.industryIdentifiers[0].identifier;
  this.bookshelf = bookshelf;
}


app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));
