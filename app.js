var express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  uri = process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
        'mongodb://localhost/boilerplate';

// Enable Jade Templating
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Load resources
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/views'));
app.use(require('./controllers'));

// Start express server
app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
