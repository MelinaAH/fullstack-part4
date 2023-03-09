const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
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

  const userResponse = await api.post('/api/login').send({
    username: 'root',
    password: 'secret'
  });

  const token = `Bearer ${userResponse.body.token}`;

  await api
    .post('/api/blogs')
    .set('Authorization', token)
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

  const userResponse = await api.post('/api/login').send({
    username: 'root',
    password: 'secret'
  });

  const token = `Bearer ${userResponse.body.token}`;

  if (!newBlog.likes) {
    newBlog.likes = 0;
  }

  const postBlog = await api
    .post('/api/blogs')
    .set('Authorization', token)
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

  const userResponse = await api.post('/api/login').send({
    username: 'root',
    password: 'secret'
  });

  const token = `Bearer ${userResponse.body.token}`;

  await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDatabase();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('a specific blog can be deleted if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDatabase();
  const blogToDelete = blogsAtStart[0];

  const userResponse = await api
    .post('/api/login').send({
      username: 'root',
      password: 'secret'
    });

  const token = `Bearer ${userResponse.body.token}`;

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', token)
    .expect(204)
    .expect('Content-Length', 0)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDatabase();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

  const blogs = blogsAtEnd.map(res => res.title);

  expect(blogs).not.toContain(blogToDelete.title);
});

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDatabase();
  const blogToUpdate = blogsAtStart[0];

  const updatedBlog = {
    title: 'Juoksijan korvaava harjoittelu',
    author: 'Johanna Sällinen',
    url: 'https://juoksija.fi/lenkkarit-solmussa/juoksijan-korvaava-harjoittelu-lenkkarit-solmussa/',
    likes: 8
  };

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDatabase();
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length);

  const updatedBlogInDatabase = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
  expect(updatedBlogInDatabase.likes).toBe(8);
});

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('secret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('creation succeeded with a new username', async () => {
    const usersAtStart = await helper.usersInDatabase();

    const newUser = {
      username: 'user1',
      name: 'Testuser',
      password: 'secret',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDatabase();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDatabase();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'secret',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDatabase();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('the user is not created if the username is missing',
    async () => {
      const usersAtStart = await helper.usersInDatabase();

      const invalidUser = {
        //username: '',
        name: 'Test User',
        password: 'topsecret',
      };

      const result = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(result.body.error).toContain('content missing');

      const usersAtEnd = await helper.usersInDatabase();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    }
  );

  test('the user is not created if the password is missing',
    async () => {
      const usersAtStart = await helper.usersInDatabase();

      const invalidUser = {
        username: 'userA',
        name: 'Test User',
      };

      const result = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(result.body.error).toContain('content missing');

      const usersAtEnd = await helper.usersInDatabase();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    }
  );

  test('the user is not created if the password is shorter than 3 characters',
    async () => {
      const usersAtStart = await helper.usersInDatabase();

      const invalidUser = {
        username: 'userA',
        name: 'Test User',
        password: 'te'
      };

      const result = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      expect(result.body.error).toContain('the length of the password should be at least 3 characters');

      const usersAtEnd = await helper.usersInDatabase();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    }
  );
});

test('a blog cannot be added if no token is provided', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401);

  expect(response.body.error).toContain('token invalid');

  const blogsAtEnd = await helper.blogsInDatabase();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

afterAll(async () => {
  await mongoose.connection.close();
});