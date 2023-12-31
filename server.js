const secret = require('./utils/secret');
const url = secret.mongodbUrl();
const http = require('http');
const cors = require('cors');
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {MongoClient} = require('mongodb');
const mongoClient = new MongoClient(url);
const server = http.createServer(app);
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secretKey = secret.secretTokenKey();

let dbClient;

const TTCDB = "TTCDB";
const UsersDB = "UsersDB";
const UsersRating = "UsersRating";
const UsersCollection = "UsersCollection";

const route_names = [
    'users',
];

let api = "";
// const usedPort = 3001;
const usedPort = 80;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((request,response,next)=>{
    if (['/users/register', '/users/login'].includes(request.path)) {
        next();
        return
    }
    let access = true;
    route_names.map(item => {
        if (request.path.indexOf(item) !== -1 && access) {
            access = false
        }
    })
    if (access) {
        next();
    } else {
        let token = null;
        if (request.headers && request.headers.cookie) {
            token = request.headers.cookie.split("=")[1]
        }
        if (token) {
            const decodeData = jwt.verify(token, secretKey)
            const {userType} = decodeData;
            if (userType === "User") {
                next();
            } else {
                response.sendStatus(403);
                response.end();
            }
        } else {
            response.sendStatus(401);
            response.end();
        }
    }
});

mongoClient.connect().then(() => {
    app.locals.usersDB = mongoClient.db(TTCDB).collection(UsersDB);
    app.locals.usersCollection = mongoClient.db(TTCDB).collection(UsersCollection);
    app.locals.usersRating = mongoClient.db(TTCDB).collection(UsersRating);
    server.listen(usedPort, function () {
        console.log("Server ready...", usedPort);
    });
});

route_names.forEach(route_name => {
    let router = require(`./routes/${route_name}`);
    app.use(`/${route_name}`, router);
});

app.use (function (request, response) {
    let filePath = '.' + request.url;
    if (filePath === './')
        filePath = './index.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    filePath = path.join(api, filePath);
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
})

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
