const { assert } = require('chai');

const { getUserByEmail, generateRandomString, emailExist, isEqualToHash, hashPassword } = require('../helpers/helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput);
  });
});

describe('emailExist', () => {
  it('should return true if valid email', () => {
    const email = 'user2@example.com';
    const expectedOutput = true;
    const answer = emailExist(testUsers, email);
    assert.equal(answer, expectedOutput);
  });
  it('should return false if invalid email', () => {
    const email = 'user432@example.com';
    const expectedOutput = false;
    const answer = emailExist(testUsers, email);
    assert.equal(answer, expectedOutput);
  });
  it('should return false if email is empty string', () => {
    const email = '';
    const expectedOutput = false;
    const answer = emailExist(testUsers, email);
    assert.equal(answer, expectedOutput);
  });

});
describe('isEqualToHash', () => {
  it('should return true with hashed and non hashed version'), () => {
    const password = '12345';
    const hashedPassword = hashPassword(password);
    const expectedOutput = true;
    const answer = isEqualToHash(password, hashedPassword);

    assert.equal(answer, expectedOutput);
  };
});

describe('generateRandomString', () => {
  it('should return a random string with a length of 6'), () => {
    const expectedOutput = 6;
    const answer = generateRandomString().length;
    assert.equal(answer, expectedOutput);
  };
});