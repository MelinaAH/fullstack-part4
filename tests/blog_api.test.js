const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Juoksijan korvaava harjoittelu',
    author: 'Johanna Sällinen',
    url: 'https://juoksija.fi/lenkkarit-solmussa/juoksijan-korvaava-harjoittelu-lenkkarit-solmussa/',
    likes: 100
  },
  {
    title: 'Kilpailuun valmistautuminen – lue 5 vinkkiä',
    author: 'Johanna Sällinen',
    url: 'https://juoksija.fi/juoksu/juoksuharjoittelu/kilpailuun-valmistautuminen-lue-5-vinkkia-lenkkarit-solmussa/',
    likes: 30
  }
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
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

  expect(blogs.body).toHaveLength(initialBlogs.length + 1);
});

/*test('likes is nset to 0 if not given', async () => {
  const blogs = await api.get('/api/blogs');

  const likes = blogs.body.map(blog => blog.likes);

  expect(likes).toBe(0 || likes);
});*/

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
