// server.js

// BASE SETUP
// =============================================================================

var mongoose   = require('mongoose');
mongoose.connect('mongodb://' + process.env.MONGOLAB_USERNAME + ':' + process.env.MONGOLAB_PASSWORD + '@ds031883.mongolab.com:31883/mean-ionic')
var Post     = require('./app/models/post');
var Comment  = require('./app/models/comment')


// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

    .post(function(req, res) {
        var post = new Post();
        post.author = req.body.author;
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

    .get(function(req, res) {

        Post.find(function(err, posts) {
            if (err) {
                res.send(err);
            }         
            res.json(posts);
        });
    });


router.route('/posts/:post_id')
    .get(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) {
                res.send(err)
            }
            res.json(post);
        })
    })

    .put(function(req, res) {
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

    .delete(function(req, res) {
        Post.remove({ _id: req.params.post_id }, function(err, post) {
            if (err) {
                res.send(err);
            }
            res.json({ message: 'Post deleted' });
        });
    });

router.route('/posts/:post_id/like')
    .put(function(req, res) {
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

    .put(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err) {
                res.send(err);
            }

            var comment = new Comment(req.body);
            comment.post = post;
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



    // .post(function(req, res) {

    //     var comment = new Comment(req.body);
    //     comment.post =  req.post;

    //     comment.save(function(err, comment) {
    //         if (err) {
    //             res.send(err);
    //         }

    //         req.post.comments.push(comment)
    //         req.post.save(function(err) {
    //             if (err) {
    //                 res.send(err);
    //             }
    //         })
    //         res.json({ message: 'Comment created!' });
    //     });
        
    // })

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