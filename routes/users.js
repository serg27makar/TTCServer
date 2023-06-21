const db = require("../modules/database");
const express = require('express');
const router = express.Router();
module.exports = router ;

router.post('/login', async (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    const { Phone, Password } = req.body;
    const user = {Password: Password, Phone: Phone};
    const collection = req.app.locals.collection;
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

router.post("/register", function (req, res) {
    if (!req.body) return res.sendStatus(400);
    const user = db.User(req.body);
    const collection = req.app.locals.collection;
    try {
        collection.insertOne(user).then(result => {
            res.send(result);
            res.end();
        })
    } catch (e) {
        res.end();
    }
});