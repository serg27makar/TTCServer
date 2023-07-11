const db = require("../modules/database");
const express = require('express');
const router = express.Router();
module.exports = router ;

router.post('/login', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { Phone, Password } = req.body;
    const user = {Password: Password, Phone: Phone};
    const collection = req.app.locals.usersDB;
    try {
        collection.findOne(user).then(result => {
            if (!result) {
                res.send('find:0');
                res.end();
            } else {
                const {UserName, _id, Phone} = result;
                const data = {
                    UserID: _id,
                    UserName,
                    Phone,
                };
                res.send(data);
                res.end();
            }
        })
    } catch (e) {
        res.end();
    }

});

router.post("/register", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const user = db.User(req.body);
    const collection = req.app.locals.usersDB;
    try {
        collection.insertOne(user).then(result => {
            res.send(result);
            res.end();
        })
    } catch (e) {
        res.end();
    }
});

router.post("/addUserInfo", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const user = db.AddedUser(req.body);
    const userRating = db.AddedUserRating(req.body);

    const usersCollection = req.app.locals.usersCollection;
    const usersRating = req.app.locals.usersRating;
    try {
        usersCollection.insertOne(user).then(result => {
            if (result && result.insertedId) {
                user.phones.map(item => {
                    const rating = {
                        rating
                    }
                })
                usersRating.insertOne().then(ratingResult => {
                    res.send(result);
                    res.end();
                })
            }
        })
    } catch (e) {
        res.end();
    }
});

router.post('/getUserInfo', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { Phone } = req.body;
    const data = { phones:{ phone: Phone}};
    const collection = req.app.locals.usersCollection;
    try {
        collection.findOne(data).then(result => {
            if (!result) {
                res.send('find:0');
                res.end();
            } else {
                res.send(result);
                res.end();
            }
        })
    } catch (e) {
        res.end();
    }
});