const { reduce } = require("lodash");

const { ObjectID } = require("mongodb").ObjectId;

module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });
      
    // PROFILE SECTION =========================
    app.get('/profile', (req, res) => {
      let menu = [
        {src:"img/causa.jpg",food:'causa',cost:8},
        {src:"img/papaALaHuancaina.jpeg",food:'Papa A La Huancaina',cost:8},
        {src:"img/papaRellena.jpeg",food:'Papa Rellena',cost:8},
        {src:"img/lomoSaltado.jpeg",food: 'Lomo Saltado', cost:17},
        {src:"img/ajiDeGallina.jpeg",food: 'Aji De Gallina', cost:17},
        {src:"img/arrozConPollo.png",food: 'Arroz Con Pollo', cost:17},
    ]
      db.collection('orders').find({user:req.user.local.email}).toArray((err, orders) => {
        if (err) return console.log(err)
        console.log(orders,'saved')
        res.render('menu.ejs', {
          menu,
          user:req.user,
          orders,
        })
        
      })
    })

    // LOGOUT ==============================
    app.get('/logout', function(req, res, next) {
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/');
        });
      });

// message board routes ===============================================================

app.post('/orders', (req, res) => {
  console.log(req.body)
  db.collection('orders').insertOne(
    {
     user: req.user.local.email,
     food: req.body.food,
     cost: req.body.cost,
     time: new Date().toLocaleTimeString(),
     paid:false
    }, 
      (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
})

app.put('/pay', (req, res) => {
  console.log(req.body)
  db.collection('orders')
  .findOneAndUpdate({_id: ObjectID(req.body._id)}, {
    $set: {
      paid:true
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.redirect('/profile')
  })
})


app.delete('/delete', (req, res) => {
  db.collection('orders').findOneAndDelete({_id: ObjectID(req.body._id)}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
