const bcrypt = require('bcrypt');

//generates random string of with 6 characters
const generateRandomString = function() {
  let output = '';
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += validChars.charAt(Math.floor(Math.random() * validChars.length));
  }
  return output;
};

//checks if email exist in the database
const emailExist = function(users, email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

//grabs the users account info by email
const getUserByEmail = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return {};
};

const hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

const isEqualToHash = function(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
};

//creates a userDatabase
const userDatabase = function(userID, urlDatabase) {
  const newDatabase = {};
  for (let user in urlDatabase) {
    const currentID = urlDatabase[user].userID;
    if (currentID === userID || currentID === "aJ48lW") {
      newDatabase[user] = urlDatabase[user];
    }
  }
  return newDatabase;
};

//returns message according to the error code
const statusMessage = function(status) {
  if (status === 200) {
    return 'OK';
  } else if (status === 403) {
    return 'Please enter a valid email and password';
  } else if (status === 400) {
    return 'The email already exists';
  } else if (status === 409) {
    return 'This already exists think of something more original please';
  } else if (status === 401) {
    return 'You not authorized bro';
  } else if (status === 404) {
    return 'DOES NOT EXIST';
  } else if (status === 406) {
    return 'Please fill out the fields';
  }
  return "Hey man I am just as confused as you.";
};

const changeStatus = function(status, code) {
  status = code;
  return status;
};

module.exports = {
  generateRandomString,
  emailExist,
  getUserByEmail,
  hashPassword,
  isEqualToHash,
  userDatabase,
  statusMessage,
  changeStatus
};