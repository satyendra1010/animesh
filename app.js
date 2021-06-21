const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
  secret: "This is a secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/ubolaDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const customerSchema = new mongoose.Schema({
  email: String,
  password: String
});

customerSchema.plugin(passportLocalMongoose);

const Customer = new mongoose.model("Customer", customerSchema);

passport.use(Customer.createStrategy());
passport.serializeUser(Customer.serializeUser());
passport.deserializeUser(Customer.deserializeUser());


const driverSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  drivingID: Number,
  aadharNumber: Number,
  phoneNumber: Number,
  carNumber: String,
  gender: String
})

const Driver = new mongoose.model("Driver", driverSchema);

app.get("/", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/registration", function(req, res) {
  const userName = req.query.user;
  if (req.isAuthenticated()) {
    res.render("registration",{username: userName});
  } else {
    res.redirect("/");
  }
});

app.get("/aboutUs", function(req, res) {
  res.render("aboutUs");
})

app.get("/index", function(req, res) {
  const userName = req.query.user;
  if (req.isAuthenticated()) {
    Driver.find(function(err, foundInfo) {
      if (err) {
        console.log(err);
      } else {
        res.render('index', {
          driverInfo: foundInfo,
          username: userName,
        })
      }
    })
  } else {
    res.redirect('/');
  }
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})

app.get('/updateForm', function(req, res) {
  const itemID = (req.query.checkbox);
  const username = req.query.user;
  Driver.findById({
    _id: itemID
  }, function(err, foundInfo) {
    if (err) {
      console.log(err);
    } else {
      res.render("updateForm", {
        info: foundInfo,username: username
      })
    }
  })
});

app.get('/home', function(req, res){
  const userName = req.query.user;
  if(req.isAuthenticated()){
    Driver.find({username: userName},function(err, foundInfo) {
      if (err) {
        console.log(err);
      } else {
        res.render('home', {
          driverInfo: foundInfo,
          username: userName,
        })
      }
    })
  }else{
    res.redirect('/')
  }
})

app.get("/userUpdate", function(req,res){
  const userName = req.query.user;
  Driver.findOne({
    username: userName
  }, function(err, foundInfo) {
    if (err) {
      console.log(err);
    } else {
      res.render("userUpdate", {
        info: foundInfo,username: userName
      })
    }
  })
})

app.get('/customer', function(req, res){
  res.render('customer')
});

app.get('/customerHome', function(req, res){
  res.render('customerHome' )
})

app.get('/customerLogin', function(req, res){
  res.render('customerLogin');
})
app.post('/register', function(req, res) {
  const userName = req.body.username;
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        if (user.username === 'admin') {
          var string = encodeURIComponent(userName);
            res.redirect('/index?user=' + string);
        }
        else {
          var string = encodeURIComponent(userName);
            res.redirect('/home?user=' + string);
        }
      })
    }
  })
});

app.post('/login', function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        if (user.username === 'admin') {
          var string = encodeURIComponent(user.username);
            res.redirect('/index?user=' + string);
        }
        else {
          var string = encodeURIComponent(user.username);
            res.redirect('/home?user=' + string);
        }
      })
    }
  })
});

app.post("/registration", function(req, res) {
  const user = req.query.user;
  const newDriver = new Driver({
    firstName: req.body.fname,
    lastName: req.body.lname,
    username: req.body.username,
    email: req.body.email,
    drivingID: req.body.driverID,
    aadharNumber: req.body.aadharID,
    phoneNumber: req.body.phoneNumber,
    carNumber: req.body.carNumber,
    gender: req.body.gender,
  });
  newDriver.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      if(user === 'admin'){
        var string = encodeURIComponent(user);
          res.redirect('/index?user=' + string);
      }else{
        var string = encodeURIComponent(user);
        res.redirect('/home?user='+ string)
      }
    }
  });

});

app.post("/index", function(req, res) {
  const username = req.query.user;
  const checkedItemId = req.body.checkbox;
  Driver.deleteOne({
    _id: checkedItemId
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log(username);
      res.redirect("/index?user="+username);
    }
  });
})

app.post("/updateForm", function(req, res) {
  const userName = req.query.user;
  const fName = req.body.fName;
  const lName = req.body.lName;
  const username = req.body.username;
  const email = req.body.email;
  const drivingID = req.body.drivingID;
  const aadhar = req.body.aadharNumber;
  const phone = req.body.phoneNumber;
  const carNumber = req.body.carNumber;
  const gender = req.body.gender;

  Driver.findOneAndUpdate({
    aadharNumber: aadhar
  }, {
    firstName: fName,
    lastName: lName,
    email: email,
    drivingID: drivingID,
    aadharNumber: aadhar,
    phoneNumber: phone,
    carNumber: carNumber,
    gender: gender
  }, function(err, foundInfo) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully updated the user!");
    }
  });

  Driver.find(function(err, foundInfo) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        driverInfo: foundInfo,
        username: userName
      })
    }
  })
})

app.post("/userupdate", function(req, res) {
  const userName = req.query.user;
  const fName = req.body.fName;
  const lName = req.body.lName;
  const username = req.body.username;
  const email = req.body.email;
  const drivingID = req.body.drivingID;
  const aadhar = req.body.aadharNumber;
  const phone = req.body.phoneNumber;
  const carNumber = req.body.carNumber;
  const gender = req.body.gender;

  Driver.findOneAndUpdate({
    aadharNumber: aadhar
  }, {
    firstName: fName,
    lastName: lName,
    email: email,
    drivingID: drivingID,
    aadharNumber: aadhar,
    phoneNumber: phone,
    carNumber: carNumber,
    gender: gender
  }, function(err, foundInfo) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully updated the user!");
    }
  });

  Driver.find({username: userName},function(err, foundInfo) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        driverInfo: foundInfo,
        username: userName
      })
    }
  })
})

app.post('/customer', function(req, res) {
  const userName = req.body.username;
  Customer.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/customer");
    } else {
      passport.authenticate("local")(req, res, function() {
        console.log("Successfully registered customer!");
          var string = encodeURIComponent(userName);
            res.redirect('/customerHome?user=' + string);
      })
    }
  })
});

app.post('/customerLogin', function(req, res) {
  const customer = new Customer({
    username: req.body.username,
    password: req.body.password
  });
  req.login(customer, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect('customerHome');
      })
    }
  })
});


app.listen(3000, function(req, res) {
  console.log("Server started on port 3000");
});
