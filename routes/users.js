const db = require("../modules/database");
const express = require('express');
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require('bcryptjs');

module.exports = router ;

router.post('/login', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { Phone, Password } = req.body;
    const user = {Phone: Phone};
    const collection = req.app.locals.usersDB;
    try {
        collection.findOne(user).then(result => {
            if (!result) {
                res.send({errMsg: "AuthError"});
                res.end();
            } else {
                const {UserName, _id, Phone, UserType, UserRole, SearchHistory} = result;
                const validPassword = bcrypt.compareSync(Password, result.Password);
                if (!validPassword) {
                    res.send({errMsg: "AuthError"});
                    res.end();
                }
                const token = db.generateAccessToken(_id, UserType);
                const data = {
                    UserID: _id,
                    UserName,
                    UserType,
                    UserRole,
                    Phone,
                    SearchHistory,
                };
                res.cookie('token', token)
                res.send(data)
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
        collection.findOne({Phone: user.Phone}).then(findRes => {
            if (findRes) {
                res.send({errMsg: "PhoneToExist"});
                res.end();
            } else {
                user.Password = bcrypt.hashSync(user.Password, 7);
                collection.insertOne(user).then(result => {
                    const token = db.generateAccessToken(result.insertedId.toString(), "User");
                    res.cookie('token', token)
                    res.send(result);
                    res.end();
                })
            }
        })
    } catch (e) {
        res.sendStatus(400);
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

router.post("/addSearchToHistory", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const {phone, date, UserID} = req.body;
    const usersDB = req.app.locals.usersDB;

    const data = {
        phone,
        date
    }

    try {
        usersDB.updateOne({_id: new ObjectId(UserID)}, {
            $set: {"SearchHistory.$[elem]": data}}, {
            arrayFilters: [{"elem.phone": phone}], upsert: true}
            ).then(result => {
            if (result && result.modifiedCount) {
                res.send(result);
                res.end();
            } else {
                usersDB.updateOne({_id: new ObjectId(UserID)}, {
                    $push: {"SearchHistory": data}}
                ).then(result2 => {
                    res.send(result2);
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
    let data = db.incrementFields(client)
    data = {...data, ...{$set: {"phones": client.phones}}}

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

router.post('/getSearchUsersInfo', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { phones } = req.body;
    const data = { phones: {$in: phones}};
    const collection = req.app.locals.usersCollection;
    try {
        collection.find(data).toArray().then(result => {
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

router.post('/checkPhoneToExist', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { Phone } = req.body;
    const data = { phones:{ phone: Phone}};
    const collection = req.app.locals.usersCollection;
    try {
        collection.findOne(data).then(result => {
            console.log(result)
            res.send(!!result);
            res.end();
        })
    } catch (e) {
        res.end();
    }
});