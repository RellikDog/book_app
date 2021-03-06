'use strict';

//Application Dependencies

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); //to allow for CSS to work correctly; from stack overflow

app.use(methodOverride((req, res) => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    console.log('INSIDE METHOD OVERRIDE');
    let method = req.body['_method'];
    delete req.body['_method'];
    return method;
  }
}));

//Postgres setup

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

//app get

app.get('/', home);
app.get('/new', newSearch);
app.get('/books/:id', getBook);
app.post('/searches', search);
app.post('/books', addBook)
app.delete('/books/:id', removeBook);
app.put('/books/:id', updateBook);

//Function Calls

function home(req, res){
  const SQL = 'SELECT * FROM books';
  return client.query(SQL)
    .then(data => {
      let books = data.rows.map(book => new DBBook(book));
      res.render('pages/index', {books});
    }).catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
}

function newSearch(req, res){
  res.render('pages/searches/new');
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
    }).catch(err => {
      res.render('pages/error', {err});
    });
}

function getBook(req, res){
  const SQL = `SELECT * FROM books WHERE id=$1;`;
  let values = [req.params.id];

  detailView(SQL, values, res);
}

function detailView(SQL, values, res){
  console.log('** POPULATING BOOKSHELVES');
  //populate dropdown with all current bookshelves from SQL
  let shelfSQL = 'SELECT DISTINCT bookshelf FROM books;';
  let bookshelves = [];

  client.query(shelfSQL)
    .then(data => {
      console.log(data.rows);
      bookshelves = [...data.rows];
    }).catch(err => {
      console.log(err);
    });

  return client.query(SQL, values)
    .then(data => {
      res.render('pages/books/show', {book: data.rows[0], bookshelves: bookshelves});
    }).catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
}

function addBook(req, res){
  //takes in info from form and creates new object
  let addedBook = new DBBook(req.body);
  let books = Object.values(addedBook);
  books.pop();

  //adds to SQL
  let SQL = `INSERT INTO books 
            (title, author, descript, image_url, isbn, bookshelf)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`;

  // redirects / renders the detail view of the book just added
  return client.query(SQL, books)
    .then(data => {
      const selection = `SELECT * FROM books WHERE id=$1;`
      let values = [data.rows[0].id];
      detailView(selection, values, res);
    })
    .catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
}

function updateBook(req, res){
  console.log('** updating book ' + req.params.id);
  const SQL = `UPDATE books
              SET title=$1, author=$2, descript=$3, isbn=$4, image_url=$5, bookshelf=$6
              WHERE id=$7`;

  let values = [req.body.title, req.body.author, req.body.descript, req.body.isbn, req.body.image_url, req.body.bookshelf, req.params.id];

  client.query(SQL, values)
    .then(data => {
      res.redirect(`/books/${req.params.id}`);
    })
    .catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
}

function removeBook(req, res){
  console.log(req.params.id);
  client.query('DELETE FROM books WHERE id=$1', [req.params.id])
    .then(() => res.redirect('/'));
}

//Constructor Functions
function DBBook(book){ //constructor for book from database
  this.title = book.title;
  this.author = book.author;
  this.descript = book.descript;
  this.image_url = book.image_url;
  this.isbn = book.isbn;
  this.bookshelf = book.bookshelf;
  this.id = book.id;
}

function Book(book, bookshelf){ //constructor for book from API
  this.title = book.volumeInfo.title || 'Book Title does not exist';
  this.author = book.volumeInfo.authors || 'Unknown Author';
  this.descript = book.volumeInfo.description;
  this.image_url = book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.isbn = book.volumeInfo.industryIdentifiers[0].type + ' ' + book.volumeInfo.industryIdentifiers[0].identifier;
  this.bookshelf = bookshelf;
}

app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));
