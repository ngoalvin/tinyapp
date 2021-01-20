const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};
const generateRandomString = function() {
  let output = '';
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += validChars.charAt(Math.floor(Math.random() * validChars.length));
  }
  return output;
};

let isLoggedIn = false;

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

// ----------------------------------- URLS --------------------------

app.get("/urls", (req, res) => {
  console.log("COOKIES", req.cookies)
  console.log("HERE", users)
  const templateVars = {
    urls : urlDatabase,
    username: req.cookies["user_id"],
    isLoggedIn,
  };
  // console.log(req.cookies.user_id)
  // console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL 
  res.redirect(`/urls/${id}`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    isLoggedIn
  }
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"],
    isLoggedIn
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//--------------------------------------------REGISTRATION----------------------------------------

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    isLoggedIn,
  }
  res.render("urls_registration", templateVars)
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const username = req.body.username
  const password = req.body.password;

  if (!(email && password)) {
    console.log("status 400");
  } else if (emailExist(users, email)) {
    console.log("ALREADY EXIST");
    res.redirect("/register")
  } else {
    users[id] = {
      id,
      username,
      email,
      password
    };
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
})

// -------------------------------------LOGIN----------------------------

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  isLoggedIn = false;
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    isLoggedIn,
  }
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  // res.cookie('username', req.body.username);
  const email = req.body.email;
  const password = req.body.password;
  const currentAccount = lookUpAccount(users, email);
  console.log("EMAIL EXIST", emailExist(users,email), "ACCOUNT", currentAccount)
  if (!emailExist(users, email) || !(currentAccount.password === password)) {
    console.log("STATUS 403")
  } else {
    res.cookie('user_id', currentAccount.id)
    isLoggedIn = true;
    res.redirect("/urls");
  }
})


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
})

app.post("/urls/:id", (req, res) => {
  const currentURL = req.params.id;
  res.redirect(`/urls/${currentURL}`);
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const currentShortUrl = req.params.shortURL
  urlDatabase[currentShortUrl] = req.body.longURL
  res.redirect(`/urls/${currentShortUrl}`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});