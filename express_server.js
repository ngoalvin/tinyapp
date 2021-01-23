const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {
  generateRandomString,
  emailExist,
  getUserByEmail,
  hashPassword,
  isEqualToHash,
  userDatabase,
  statusMessage,
  changeStatus
} = require("./helpers/helpers");

const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

let status = 200;

let isLoggedIn = false;

// ----------------------------------- URLS --------------------------

app.get("/urls", (req, res) => {
  status = res.statusCode;
  if (!isLoggedIn) {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status");
  } else {
    const userID = req.session.userID;
    const usersUrl = userDatabase(userID, urlDatabase);
    const email = users[userID].email;
    const templateVars = {
      userID,
      isLoggedIn,
      email,
      urls : usersUrl,
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  urlDatabase[id] = { longURL, userID };
  res.redirect(`/urls/${id}`);
});

app.get("/", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

//------------------------------------------- NEW -------------------------------------------

app.get("/urls/new", (req, res) => {
  status = res.statusCode;
  if (!isLoggedIn) {
    res.redirect("/login");
  } else {
    const userID = req.session.userID;
    const email = users[userID].email;
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn,
      email
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  status = res.statusCode;
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    const userID = req.session.userID;
    const shortURL = req.params.shortURL;
    const urlData = urlDatabase[shortURL];
    if (!urlData) {
      status = changeStatus(res.statusCode, 404);
      res.redirect("/status");
      //checks if logged in user owns the URL
    } else if (urlData.userID === userID) {
      const longURL = urlData.longURL;
      const email = users[userID].email;
      const templateVars = {
        shortURL,
        longURL,
        userID,
        isLoggedIn,
        email
      };
      res.render("urls_show", templateVars);
    } else {
      status = changeStatus(res.statusCode, 401);
      res.redirect("/status");
    }
  } else {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status");
  }
});

app.post("/urls/:id", (req, res) => {
  const currentURL = req.params.id;
  const userID = req.session.userID;
  const currentAccount = userDatabase(userID, urlDatabase);
  if (currentAccount[currentURL]) {
    res.redirect(`${currentURL}`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  status = res.statusCode;
  const shortURL = req.params.shortURL;
  const urlData = urlDatabase[shortURL];
  if (!urlData) {
    status = changeStatus(res.statusCode, 404);
    res.redirect("/status");
  } else {
    const longURL = urlData.longURL;
    res.redirect(longURL);
  }
});


//--------------------------------------------REGISTRATION----------------------------------------

app.get("/register", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn,
    };
    res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!(email && password)) {
    status = changeStatus(res.statusCode, 406);
    res.redirect("/status");
  } else if (emailExist(users, email)) {
    status = changeStatus(res.statusCode, 409);
    res.redirect("/status");
  } else {
    const hashedPassword = hashPassword(password);
    users[id] = {
      id,
      email,
      hashedPassword
    };
    req.session.userID = id;
    isLoggedIn = true;
    res.redirect("/urls");
  }
});

// -------------------------------------LOGIN----------------------------

app.post("/logout", (req,res) => {
  req.session.userID = null;
  isLoggedIn = false;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn,
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentAccount = getUserByEmail(email, users);
  //checking if email exists or if password don't match
  if (!emailExist(users, email) || !isEqualToHash(password, currentAccount.hashedPassword)) {
    status = changeStatus(res.statusCode, 403);
    res.redirect("/status");
  } else {
    req.session.userID = currentAccount.id;
    isLoggedIn = true;
    res.redirect("/urls");
  }
});

//----------------------------------- STATUS-------------------------------

app.get("/status", (req, res) => {
  const templateVars = {
    status,
    message : statusMessage(status)
  };
  res.render("status_page", templateVars);
});

//----------------------------------------------EDIT/DELETE-----------------------

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const urlInfo = urlDatabase[req.params.shortURL];

  if (isLoggedIn) {
    if (urlInfo.userID === userID) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      status = changeStatus(res.statusCode, 401);
      res.redirect("/status");
    }
  } else {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  const urlInfo = urlDatabase[shortURL];

  //check if userID of person is same as userID of URL
  if (urlInfo.userID === userID) {
    urlDatabase[shortURL] = { longURL, userID };
  } else {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status");
  }
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});