const dummy = () => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes;
  };
  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const maxLikes = blogs.reduce((max, blog) =>
    blog.likes > max ? blog.likes : max, 0);

  return blogs.find(blog => blog.likes === maxLikes);
};

const mostBlogs = (blogs) => {
  // Let's create an empty array on which
  // the bloggers are collected
  let bloggers = [];

  if (blogs.length === 0) {
    return undefined;
  }

  blogs.forEach(blog => {
    // adds a name of the blogger if it doesn't exist yet
    if (!bloggers.includes(blog.author)) {
      bloggers.push(blog.author);
    }
  });

  // Let's create an array which includes the number of
  // blogs with the author's name
  let bloggersAndNumberOfBlogs = bloggers.map(blogger => {
    // loops all blogs and counts the number of blogs
    let numberOfblogs = 0;
    blogs.forEach(blog => {
      if (blog.author === blogger) {
        numberOfblogs ++;
      }
    });

    return { blogger: blogger, numberOfblogs };
  });

  // finds a blogger who has the most blogs
  let maxBlogsAuthor = bloggersAndNumberOfBlogs[0];
  bloggersAndNumberOfBlogs.forEach(blogger => {
    if (blogger.numberOfblogs > maxBlogsAuthor.numberOfblogs) {
      maxBlogsAuthor = blogger;
    }
  });

  return {
    author: maxBlogsAuthor.author,
    blogs: maxBlogsAuthor.numberOfblogs
  };
};

const mostLikes = (blogs) => {
  // Let's create an empty array on which
  // the bloggers are collected
  let bloggers = [];

  blogs.forEach(blog => {
    // adds a name of the blogger if it doesn't exist yet
    if (!bloggers.includes(blog.author)) {
      bloggers.push(blog.author);
    }
  });

  // Let's create an array which includes the number of
  // likes with the author's name
  let bloggersAndNumberOfLikes = bloggers.map(blogger => {
    // loops all blogs and counts the number of blogs
    let numberOfLikes = 0;
    blogs.forEach(blog => {
      if (blog.author === blogger) {
        numberOfLikes + blog.likes;
      }
    });

    return { blogger: blogger, numberOfLikes };
  });

  // finds a blogger who has the most blogs
  let maxLikesAuthor = bloggersAndNumberOfLikes[0];
  bloggersAndNumberOfLikes.forEach(blogger => {
    if (blogger.numberOfblogs > maxLikesAuthor.numberOfLikes) {
      maxLikesAuthor = blogger;
    }
  });

  return {
    author: maxLikesAuthor.author,
    likes: maxLikesAuthor.numberOfblogs
  };
};

module.exports =
{
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};