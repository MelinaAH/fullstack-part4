const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const logger = require('../utils/logger');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  logger.info(blogs);
  response.json(blogs);
  //.catch(error => logger.error(error.message));
});

blogsRouter.post('/', (request, response) => {
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
    .catch(error => logger.error(error.message));
});

module.exports = blogsRouter;