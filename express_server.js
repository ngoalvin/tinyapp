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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

let status = 200;

let isLoggedIn = false;

// ----------------------------------- URLS --------------------------

app.get("/urls", (req, res) => {
  status = res.statusCode;
  if (!isLoggedIn) {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status")
  } else {
    const userID = req.session.userID;
    const usersUrl = userDatabase(userID, urlDatabase);
    const templateVars = {
      userID,
      isLoggedIn,
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
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn
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
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.session.userID,
    isLoggedIn
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  status = res.statusCode;
  // console.log("PARAMS OVER HERE:", req.params)
  // const longURL = urlDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const currentURL = req.params.id;
  const userID = req.session.userID;
  const currentAccount = userDatabase(userID, urlDatabase)
  console.log("OVER HERE", currentAccount[currentURL])
  if (currentAccount[currentURL]) {
    res.redirect(`${currentURL}`);
  }
});

//--------------------------------------------REGISTRATION----------------------------------------

app.get("/register", (req, res) => {
  status = res.statusCode;
  const templateVars = {
    userID: req.session.userID,
    isLoggedIn,
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = hashPassword(password);

  if (!(email && password)) {
    status = changeStatus(res.statusCode, 400)
    res.redirect("/status")
  } else if (emailExist(users, email)) {
    status = changeStatus(res.statusCode, 409)
    res.redirect("/status");
  } else {
    users[id] = {
      id,
      email,
      hashedPassword
    };
    req.session.userID = id;
    res.redirect("/");
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
    status = changeStatus(res.statusCode, 403)
    res.redirect("/status")
  } else {
    req.session.userID = currentAccount.id;
    isLoggedIn = true;
    res.redirect("/urls");
  }
});

app.get("/status", (req, res) => {
  const templateVars = {
    status,
    message : statusMessage(status)
  }
  console.log(templateVars)
  res.render("status_page", templateVars)
})


app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const userURLS = userDatabase(userID, urlDatabase);
  const urlInfo = urlDatabase[req.params.shortURL];

  if (isLoggedIn) {
    if (urlInfo.userID === userID || urlInfo.userID === 'aJ48lW') {
      delete urlDatabase[req.params.shortURL];
    }
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