'use strict'
// set up ======================================================================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console
var bodyParser = require('body-parser');    // pull information from HTML POST
var methodOverride = require('method-override'); // simulate DELETE and PUT
var port = process.env.PORT || 8080;

// configuration ===============================================================

mongoose.connect('mongodb://localhost/mean-tea-db');     // connect to mongoDB database

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// define model ================================================================
var Tea = mongoose.model('Tea', {
  name: { type: String, required: true, trim: true },
  ingredients: String,
  caffeineScale: Number,
  price: Number,
  inStock: Boolean,
  categories: [],
  rating: Number,
  imageUrl: String
});

var Cart = mongoose.model('Cart', {
  items: []
});

// routes ======================================================================
  // api ---------------------------------------------------------------------
  // get all teas
  app.get('/api/teas', function (req, res) {
    // use mongoose to get all teas in the database
    Tea.find(function(err, teas) {
      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(teas); // return all teas in JSON format
    });
  });

  // create tea
  app.post('/api/teas', function(req, res) {
    var newTea = Tea.create(req.body,function(err){
      if (err) {
        return res.send(err)
      }
      res.json({ message: 'Tea created!' });
    });
  });

  // read, update and delete tea
  app.get('/api/teas/:_id', function(req, res) {
    Tea.findById(req.params,function(err,tea){
      if (err) res.send(err);
      res.json(tea);
    });
  });

  app.put('/api/teas/:_id', function(req, res) {
    Tea.findById(req.params,function(err,tea){

      if (err) res.send(err);

      tea.name = req.body.name;
      tea.ingredients = req.body.ingredients;
      tea.caffeineScale = req.body.caffeineScale;
      tea.price = req.body.price;
      tea.inStock = req.body.inStock;
      tea.rating = req.body.rating;
      tea.categories = req.body.categories;

      tea.save(function(err){
        if (err) res.send(err);
        res.json({message:'Tea updated'})
      });
    });
  });

  app.delete('/api/teas/:_id', function(req, res) {
    Tea.remove({_id:req.params._id}, function(err,tea){
      if (err) return res.send(err);
      res.json({ message: 'Tea successfully deleted' });
    });
  });

  // application -------------------------------------------------------------
  app.get('*', function(req, res) {
      res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
  });

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
