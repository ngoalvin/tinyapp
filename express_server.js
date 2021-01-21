const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString, emailExist, lookUpAccount, hashPassword, isEqualToHash} = require("./helpers/helpers");

const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

let isLoggedIn = false;

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

// ----------------------------------- URLS --------------------------

app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const usersUrl = userDatabase(userID, urlDatabase)
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
  const userID = req.cookies["userID"]
  urlDatabase[id] = { longURL, userID } 
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
      userID: req.cookies["userID"],
      isLoggedIn
    }
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
    userID: req.cookies["userID"],
    isLoggedIn
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log("PARAMS OVER HERE:", req.params)
  // const longURL = urlDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const currentURL = req.params.id;
  res.redirect(`${currentURL}`);
})

//--------------------------------------------REGISTRATION----------------------------------------

app.get("/register", (req, res) => {
  const templateVars = {
    userID: req.cookies["userID"],
    isLoggedIn,
  }
  res.render("urls_registration", templateVars)
})

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
    res.redirect("/register")
  } else {
    users[id] = {
      id,
      // username,
      email,
      hashedPassword
    };
    res.cookie('userID', id);
    res.redirect("/urls");
  }
})

// -------------------------------------LOGIN----------------------------

app.post("/logout", (req,res) => {
  res.clearCookie("userID");
  isLoggedIn = false;
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.cookies["userID"],
    isLoggedIn,
  }
  res.render("urls_login", templateVars)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentAccount = lookUpAccount(users, email);
  if (!emailExist(users, email) || !isEqualToHash(password, currentAccount.hashedPassword)) {
    console.log("STATUS 403")
  } else {
    res.cookie('userID', currentAccount.id)
    isLoggedIn = true;
    res.redirect("/urls");
  }
})


app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["userID"];
  const urlInfo = urlDatabase[req.params.shortURL];

  console.log(userID);
  console.log(urlInfo)
  if (urlInfo.userID === userID || urlInfo.userID === 'aJ48lW') {
    delete urlDatabase[req.params.shortURL];
  } 
  res.redirect(`/urls`);
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortUrl = req.params.shortURL
  const longURL = req.body.longURL;
  const userID = req.cookies["userID"]
  const urlInfo = urlDatabase[currentShortUrl];

  if (urlInfo.userID === userID || urlInfo.userID === 'aJ48lW') {
    urlDatabase[shortUrl] = { longURL, userID }
  } 
  res.redirect(`/urls/${currentShortUrl}`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});