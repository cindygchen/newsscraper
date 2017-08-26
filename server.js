// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Requiring our Comment and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
// HTML Routing
var htmlRoutes = require("./controllers/htmlRoutes.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var port =process.env.PORT || 3000;
var app = express();

// Use and body parser with our app
app.use(bodyParser.urlencoded({
  extended: false
}));

// Initialize handlebars
app.engine("handlebars", exphbs({ defaultLayout:"main"}));
app.set("view engine", "handlebars");

// Routing
app.use("/", htmlRoutes);

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
// mongoose.connect("mongodb://heroku_3wdkcx0x:graes7t0thvggbvhggrrf68pvt@ds149603.mlab.com:49603/heroku_3wdkcx0x");
mongoose.connect("mongodb://localhost/newsscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// ======

// A GET request to scrape the medium website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://medium.com/topic/popular", function(error, response, html) {
    console.log(error);
    
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h3 within an article tag, and do the following:
    $("section.u-borderBox > div.u-borderBox > div.u-flex").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children("div.u-borderBox").children("div.u-flex1").children("div.u-flexColumnTop").children("div.u-flex0").children("a").children("h3").text();
      console.log(result.title);
      // result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });
  });
  // Tell the browser that we finished scraping the text
  res.redirect("/");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the Comments associated with it
  .populate("comment")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new Comment or replace an existing Comment
app.post("/savecomment/:id", function(req, res) {
  // Create a new Comment and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new Comment the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's Comment
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comment": doc._id }})
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
