const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const middleware = require('../utils/middleware')
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  logger.info(blogs);
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;
  console.log('request body:', body);

  if (!request.user) {
    return response.status(401).json({ error: 'token invalid' });
  }

  if (!body.title || !body.url) {
    console.log('title:', body.title, 'url:', body.url);
    return response.status(400).json({
      error: 'Bad request: the title or url is missing'
    });
  }

  const user = await User.findById(request.user);
  console.log('user:', user);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);

});

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
  response.status(200).json(updatedBlog);
});

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id);

  if (!request.user || !request.token) {
    return response.status(401).json({ error: 'token invalid' });
  }

  if (blogToDelete.user._id.toString() === request.user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  }
  else {
    return response.status(401).json( { error: 'You are not allowed to remove this blog' });
  }
});

module.exports = blogsRouter;