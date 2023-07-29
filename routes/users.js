const db = require("../modules/database");
const express = require('express');
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;
module.exports = router ;

router.post('/login', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { Phone, Password } = req.body;
    const user = {Password: Password, Phone: Phone};
    const collection = req.app.locals.usersDB;
    try {
        collection.findOne(user).then(result => {
            if (!result) {
                res.send(null);
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
    const client = db.AddedClient(req.body);
    const usRating = db.AddedUserRating(req.body);

    const usersCollection = req.app.locals.usersCollection;
    const usersRating = req.app.locals.usersRating;
    try {
        usersCollection.insertOne(client).then(result => {
            if (result && result.insertedId) {
                usersRating.insertOne(usRating).then(ratingResult => {
                    res.send(result);
                    res.end();
                })
            }
        })
    } catch (e) {
        res.end();
    }
});

router.post("/editUserInfo", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const client = db.AddedClient(req.body);
    let usRating = db.AddedUserRating(req.body);
    usRating = {...usRating, usRating: client.id}

    const usersCollection = req.app.locals.usersCollection;
    const usersRating = req.app.locals.usersRating;
    const data = db.incrementFields(client)

    try {
        usersCollection.updateOne({_id: new ObjectId(client.id)}, data).then(result => {
            if (result && result.modifiedCount) {
                usersRating.insertOne(usRating).then(ratingResult => {
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
                res.send(null);
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