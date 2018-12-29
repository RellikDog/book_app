'use strict';

//Application Dependencies

const express = require('express');

const superagent = require('superagent');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public')); //to allow for CSS to work correctly; from stack overflow

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

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
    }).catch(err => {
      res.render('pages/error', {err});
    });
}

//Constructor Functions
function Book(book){
  console.log(book)
  this.title = book.volumeInfo.title || 'Book Title does not exist';
  this.author = book.volumeInfo.authors || 'Unknown Author';
  this.description = book.volumeInfo.description;
  this.image = book.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
}


app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));
