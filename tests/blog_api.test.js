const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

afterAll(async () => {
  await mongoose.connection.close();
});

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(2);
});

test('the blog identifier field is called id', async () => {
  const blogs = await api.get('/api/blogs');

  const ids = blogs.body.map(blog => blog.id);

  expect(ids).toBeDefined();
});

test('a blog can be added', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogs = await api.get('/api/blogs');

  expect(blogs.body).toHaveLength(helper.initialBlogs.length + 1);
});

test('likes is set to 0 if not given', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
  };

  if (!newBlog.likes) {
    newBlog.likes = 0;
  }

  const postBlog = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  expect(postBlog.body.likes).toBe(0);
});

test('a title or url is missing', async () => {
  const newBlog = {
    //title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDatabase();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});
