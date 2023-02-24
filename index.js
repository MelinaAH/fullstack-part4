const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
//const Blog = require('./models/blog');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const mongoUrl = process.env.MONGODB_URI;

console.log('connecting to', mongoUrl);
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
});

const Blog = mongoose.model('Blog', blogSchema);

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      console.log(blogs);
      response.json(blogs);
    })
    .catch(error => console.log(error.message));
});

app.post('/api/blogs', (request, response) => {
  //const blog = new Blog(request.body);
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes
  });

  blog
    .save()
    .then(result => {
      response.status(201).json(result);
    })
    .catch(error => console.log(error.message));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});