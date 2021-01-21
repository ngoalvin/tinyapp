const bcrypt = require('bcrypt');

const generateRandomString = function() {
  let output = '';
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += validChars.charAt(Math.floor(Math.random() * validChars.length));
  }
  return output;
};

const emailExist = function(users, email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}

const getUserByEmail = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key]
    }
  }
  return {};
}

const hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
}

const isEqualToHash = function(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}


const userDatabase = function(userID, urlDatabase) {
  const newDatabase = {}
  for (let user in urlDatabase) {
    const currentID = urlDatabase[user].userID
    if (currentID === userID || currentID === "aJ48lW") {
      newDatabase[user] = urlDatabase[user]
    }
  }
  return newDatabase;
}


module.exports = { generateRandomString, emailExist, getUserByEmail, hashPassword, isEqualToHash, userDatabase }