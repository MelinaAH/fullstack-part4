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
  const body = request.body;

  if (!body.title || !body.url) {
    return response.status(400).json({
      error: 'Bad request'
    });
  }

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

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
    response.status(200).json(updatedBlog);
  }
  catch (exception) {
    next(exception);
  }
});

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  }
  catch(exception) {
    next(exception);
  }
});

module.exports = blogsRouter;