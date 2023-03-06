const Blog = require('../models/blog');
const User = require('../models/user');

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

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  });

  await blog.save();
  await blog.remove();

  return blog.id.toString();
};

const blogsInDatabase = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

const usersInDatabase = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = { nonExistingId, initialBlogs, blogsInDatabase, usersInDatabase };