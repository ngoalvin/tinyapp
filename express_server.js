const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString, emailExist, getUserByEmail, hashPassword, isEqualToHash, userDatabase} = require("./helpers/helpers");

const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['test'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

let isLoggedIn = false;

// ----------------------------------- URLS --------------------------

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const usersUrl = userDatabase(userID, urlDatabase);
  const templateVars = {
    urls : usersUrl,
    userID,
    isLoggedIn,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  urlDatabase[id] = { longURL, userID };
  res.redirect(`/urls/${id}`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//------------------------------------------- NEW -------------------------------------------

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn) {
    res.redirect("/login");
  } else {
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.session.userID,
    isLoggedIn
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log("PARAMS OVER HERE:", req.params)
  // const longURL = urlDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const currentURL = req.params.id;
  res.redirect(`${currentURL}`);
});

//--------------------------------------------REGISTRATION----------------------------------------

app.get("/register", (req, res) => {
  const templateVars = {
    userID: req.session.userID,
    isLoggedIn,
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  // const username = req.body.username
  const password = req.body.password;
  const hashedPassword = hashPassword(password);

  if (!(email && password)) {
    console.log("status 400");
  } else if (emailExist(users, email)) {
    console.log("ALREADY EXIST");
    res.redirect("/register");
  } else {
    users[id] = {
      id,
      // username,
      email,
      hashedPassword
    };
    req.session.userID = id;
    res.redirect("/urls");
  }
});

// -------------------------------------LOGIN----------------------------

app.post("/logout", (req,res) => {
  req.session.userID = null;
  isLoggedIn = false;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.session.userID,
    isLoggedIn,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentAccount = getUserByEmail(email, users);
  if (!emailExist(users, email) || !isEqualToHash(password, currentAccount.hashedPassword)) {
    console.log("STATUS 403");
  } else {
    req.session.userID = currentAccount.id;
    isLoggedIn = true;
    res.redirect("/urls");
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const urlInfo = urlDatabase[req.params.shortURL];

  if (urlInfo.userID === userID || urlInfo.userID === 'aJ48lW') {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  const urlInfo = urlDatabase[shortURL];

  if (urlInfo.userID === userID || urlInfo.userID === 'aJ48lW') {
    urlDatabase[shortURL] = { longURL, userID };
  }
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});