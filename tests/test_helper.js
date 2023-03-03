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

const blogsInDatabase = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

module.exports = { initialBlogs, blogsInDatabase };