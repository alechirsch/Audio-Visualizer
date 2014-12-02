var Hapi = require('hapi');
var fs = require('fs');
var request = require('request');
var server = new Hapi.Server('0.0.0.0', process.env.PORT || 8000, {
    "payload": {
        "maxBytes": 104857600 //Increasing max file size to 1MB
    }
});
server.route({
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        reply.file('view.html');
    }
});
server.route({
    method: 'GET',
    path: '/watch',
    handler: function(req, reply) {
        if (req.query.v) {
            var stream = fs.createWriteStream(req.query.v + '.mp3');
            stream.on('close', function() {
                reply("finished!");
            });
            request('http://YouTubeInMP3.com/fetch/?video=http://www.youtube.com/watch?v=' + req.query.v).pipe(stream);
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
