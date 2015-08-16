// server.js

// BASE SETUP
// =============================================================================

var mongoose   = require('mongoose');
var passport = require('passport');
mongoose.connect('mongodb://' + process.env.MONGOLAB_USERNAME + ':' + process.env.MONGOLAB_PASSWORD + '@ds031883.mongolab.com:31883/mean-ionic')
var Post     = require('./app/models/post');
var Comment  = require('./app/models/comment');
var User     = require('./app/models/user');
var passportConfig = require('./app/config/passport');
var jwt = require('express-jwt');
var auth = jwt({ secret: process.env.JWT_SECRET, userPropery: 'payload' });




// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/posts')

    .post(auth, function(req, res) {
        var post = new Post(req.body);
        post.author = req.payload.author;
        post.location = req.body.location;
        post.message = req.body.message;
        post.likes = req.body.likes;
        post.image = req.body.image;

        post.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Post created!' });
        });
        
    })

    .get(auth, function(req, res) {

        Post.find(function(err, posts) {
            if (err) {
                res.send(err);
            }         
            res.json(posts);
        });
    });


router.route('/posts/:post_id')
    .get(auth, function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) {
                res.send(err)
            }
            res.json(post);
        })
    })

    .put(auth, function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) {
                res.send(err);
            }
            post.author = req.body.author;
            post.location = req.body.location;
            post.message = req.body.message;
            post.likes = req.body.likes;
            post.image = req.body.image;            
            post.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json({ message: 'post has been successfully updated' });
            });
        });
    })

    .delete(auth, function(req, res) {
        Post.remove({ _id: req.params.post_id }, function(err, post) {
            if (err) {
                res.send(err);
            }
            res.json({ message: 'Post deleted' });
        });
    });

router.route('/posts/:post_id/like')
    .put(auth, function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) {
                res.send(err);
            }
            post.likes ++;            
            post.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json({ message: 'post has been liked' });
            });
        });
    })

router.route('/posts/:post_id/comments')

    .post(auth, function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) {
                res.send(err);
            }

            var comment = new Comment(req.body);
            comment.post = post;
            comment.body = req.body.body;
            comment.author = req.payload.author;
            comment.save(function(err, comment) {
                if (err) {
                    res.send(err);
                }
                post.comments.push(comment)            
                post.save(function(err) {
                    if (err) {
                        res.send(err);
                    }
                    res.json({ message: 'post has been liked' });
                });
            })
        });
    })


router.post('/register', function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out all fields.' });
    }

    var user = new User(req.body);
    user.username = req.body.username;
    user.setPassword(req.body.password);
    user.save(function(err) {
        if (err) {
            return next(err);
        }
        return res.json({ token: user.generateJWT() });
    });
})

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

// more routes for our API will happen here

app.all('/api/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    return next();
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);