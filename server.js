var Hapi = require('hapi');
var fs = require('fs');
var ytdl =  require('ytdl-core'); 
var ejs = require('ejs');
var Path = require('path');
var server = new Hapi.Server('0.0.0.0', process.env.PORT || 8000, {
    "payload": {
        "maxBytes": 104857600 //Increasing max file size to 1MB
    }
});
server.views({
    engines: {
        ejs: ejs
    },
    path: Path.join(__dirname, 'views')
});
server.route({
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        reply.view('view.ejs', {video_id: false});
    }
});
server.route({
    method: 'GET',
    path: '/watch',
    handler: function(req, reply) {
        if (req.query.v) {
            var stream = fs.createWriteStream("public/" + req.query.v + '.mp4');
            stream.on('close', function() {
               reply.view('view.ejs', { video_id: req.query.v });
            });
            ytdl('http://www.youtube.com/watch?v=' + req.query.v).pipe(stream);
        }
    }
});
server.route({
    method: "GET",
    path: "/public/{path*}", //exposes public directory to public
    handler: {
        directory: {
            path: "./public",
            listing: false,
            index: false
        }
    }
});
server.start();
console.log('Server started on localhost:8000');

