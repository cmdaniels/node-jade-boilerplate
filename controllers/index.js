var express = require('express'),
  router = express.Router(),
  User = require('../models/user.js');

router.get('/', function(req, res) {
  res.render('index', {
    title: 'Node Boilerplate'
  });
});

module.exports = router;
