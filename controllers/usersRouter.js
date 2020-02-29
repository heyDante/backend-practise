const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();

const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('notes');
  res.json(users.map((user) => user.toJSON()));
});

/* -- POST -- */
usersRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash    //remember not to store the passwords
    });

    const savedUser = await user.save();

    res.json(savedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;