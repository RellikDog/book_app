DROP TABLE IF EXISTS books;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    image_url TEXT,
    descript TEXT, 
    bookshelf VARCHAR(255)
);
