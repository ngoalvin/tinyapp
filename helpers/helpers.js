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

const lookUpAccount = function(users, email) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key]
    }
  }
  return {};
}

module.exports = { generateRandomString, emailExist, lookUpAccount }