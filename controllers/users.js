const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');
const logger = require('../utils/logger');

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  if (await User.findOne({ username })) {
    return response.status(400).json({ error: 'expected `username` to be unique' });
  }

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  }
  catch (expectation) {
    next(expectation);
  }
});

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({});
    logger.info(users);
    response.json(users);
  }
  catch(expectation) {
    next(expectation);
  }
});

module.exports = usersRouter;