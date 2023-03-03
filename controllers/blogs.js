const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const logger = require('../utils/logger');

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({});
    logger.info(blogs);
    response.json(blogs);
  }
  catch(expectation) {
    next(expectation);
  }
});

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes
  });

  try {
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog);
  }
  catch (expectation) {
    next(expectation);
  }
});

module.exports = blogsRouter;