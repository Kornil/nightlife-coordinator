var passport = require('passport');
var Account = require('../models/account');
var Local = require('../models/locals');
//var oauth = require('../oauth');

module.exports = function (app) {

  var Yelp = require('yelp');
  var num = 0;
  var yelp = new Yelp({
    consumer_key: process.env.YELP_CONSUMER_KEY,
    consumer_secret: process.env.YELP_CONSUMER_SECRET,
    token: process.env.YELP_TOKEN,
    token_secret: process.env.YELP_SECRET,
  });

  app.use(require('body-parser').urlencoded({ extended: true }));

  app.get('/', function (req, res) {
    Local.find({}, function(err, locals){      
      res.render('index', { user : req.user, locals: locals });
    })
  });

  app.post('/check/:id', function(req, res){
    Local.find({local_id: req.params.id}, function(err, data){
      if (err) throw err;
      if (data) {
        num = data.people_going
      }else{
        num = 0;
      }
      res.redirect('/');
    });
  });

  app.post('/search/:place', function(req, res){
    yelp.search({ term: 'bar', location: req.params.place })
    .then(function (data) {
      res.send(data);
    })
    .catch(function (err) {
      console.error(err);
    });
  });

  app.post('/going/:id', function(req, res){
    if(typeof req.user !== "undefined"){

      Local.find({local_id: req.params.id}).exec()
        .then(function(elem){
          if (elem.length){

            if(elem.users.includes(req.user.username)){
              Local.update({local_id: req.params.id},{$inc: { 'people_going': 1}, $push: { users: req.user.username }}).exec().then(function(){
                res.redirect('/');
              })
            }else{
              res.redirect('/');
            }

          }else{
            var newLocal = Local({
              local_id: req.params.id,
              users: req.user.username,
              people_going: 1
            });
            newLocal.save()
              .then(function(){
                res.redirect('/');
              });
          }
        }).catch(function(err){
          throw err;
        });

    }
  });

  app.get('/register', function(req, res) {
      res.render('register', { });
  });

  app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }
    });
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/'} );
    res.redirect('/');
  });

  app.get('/login', function(req, res) {
      res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'}) );

  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

}