var express = require('express');
var router = express.Router();
var DB = require('../../models.js');
var jwt = require('jsonwebtoken');



router.get('/user', function(req, res, next) {
  DB.user.getAllUsers(function(err, users) {
    if(err) {
      res.json({
         success: false,
         message: 'Failed load users'
       });
       return next();
    }
    res.json({
       success: true,
       data: users
     });
  });
});

router.get('/user/:id', function(req, res, next) {
  DB.user.getUserById(req.params.id, function(err, user) {
    if(err) {
      res.json({
         success: false,
         message: 'Failed load user'
       });
       return next();
    }
    res.json({
       success: true,
       data: user
     });
  });
});

//Get token by ID
router.get('/user/:id/token', function(req, res, next) {
  DB.user.getUserById(req.params.id, function(err, user) {
    if(err) {
      res.json({
         success: false,
         message: 'Failed load user'
       });
       return next();
    }
    delete user.password;
    delete user.salt;
    delete user.iteration;
    var token = jwt.sign(user, 'secret');
    res.json({
     success: true,
     data: token
    });
  });
});

/* POST /users */
router.post('/user', function(req, res, next) {
  if (!req.body.email || !req.body.password ) {
    res.json({
       success: false,
       message: 'Missing Email or Password'
     });
    return next();
  }
  DB.user.createUser(req.body, function (err, user) {
    if(err) {
      console.log("Error User : " , err);
      res.json({
         success: false,
         message: err
       });
       return next();
    }
    res.json({
       success: true,
       data: user
     });
    return next();
  });
});

router.delete('/user/:id', function(req, res, next) {
  DB.user.deleteUser(req.params.id, function(err) {
    if(err) {
      res.json({
         success: false,
         message: err
       });
       return next();
    }
    res.json({
       success: true
     });
  });
});

router.put('/user/:id', function(req, res, next) {
  console.log('req id', req.params.id);
  console.log('req body ', req.body);

  DB.user.updateUser(req.params.id, req.body, function(err) {
    console.log('err', err);
    if(err) {
      res.json({
         success: false,
         message: err
       });
       return next();
    }
    res.json({
       success: true,
     });
  });
});

require('./course.js')(router, DB);



module.exports = router;
