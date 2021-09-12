const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const removePassword = (userObj) => {
  // eslint-disable-next-line no-param-reassign
  delete userObj.password;
};

const authenticateUser = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    return false;
  }

  const userObj = user.toObject();

  const hashPassword = userObj.password;

  const isPasswordValid = await bcrypt.compare(password, hashPassword);

  if (!isPasswordValid) {
    return false;
  }

  removePassword(userObj);

  return userObj;
};

const getUser = async (params = {}) => {
  const user = await User.findOne(params);

  if (!user) {
    return false;
  }

  const userObj = user.toObject();

  removePassword(userObj);

  return userObj;
};

const createUser = async (params = {}) => {
  const newUser = new User({ ...params });
  const savedUser = await newUser.save();
  if (!savedUser) {
    return savedUser;
  }
  const userObj = savedUser.toObject();

  removePassword(userObj);

  return userObj;
};

module.exports = { getUser, createUser, authenticateUser };
