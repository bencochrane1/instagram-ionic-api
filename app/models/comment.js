var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var CommentSchema = new Schema({
    body: String,
    author: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

mongoose.model('Comment', CommentSchema);