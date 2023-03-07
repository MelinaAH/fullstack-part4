const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');
const logger = require('../utils/logger');

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  try {
    if (await User.findOne({ username })) {
      return response.status(400).json({ error: 'expected `username` to be unique' });
    }
    else if (username === undefined || password === undefined) {
      return response.status(400).json({ error: 'content missing' });
    }
    else if (password.length < 3) {
      return response.status(400).json({ error: 'the length of the password should be at least 3 characters' });
    }
    else {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        name,
        passwordHash,
      });

      const savedUser = await user.save();
      response.status(201).json(savedUser);
    }
  }
  catch (expectation) {
    next(expectation);
  }
});

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User
      .find({})
      .populate('blogs', { title: 1, author: 1, url: 1 });
    logger.info(users);
    response.json(users);
  }
  catch (expectation) {
    next(expectation);
  }
});

module.exports = usersRouter;