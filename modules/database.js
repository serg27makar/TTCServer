const express = require('express');
const router = express.Router();
module.exports = router ;

const userType = {
    CARRIER: "carrier",
    TRADER: "trader",
    DISPATCHER: "dispatcher",
}

module.exports.User = function(body) {
    const { UserName, Email, Permission, Password, Phone } = body;
    let user = {};
    if (Phone) user = {...user, Phone};
    if (Email) user = {...user, Email};
    if (UserName) user = {...user, UserName};
    if (Password) user = {...user, Password};
    if (Permission) user = {...user, Permission};
    return user;
};

module.exports.AddedUserRating = function(body) {
    const {ratingPoint, calcRatingPoint, infoRatingPoint, downtimeRatingPoint} = body;
    let rating = {}
    if (ratingPoint) rating = {...rating, ratingPoint}
    if (calcRatingPoint) rating = {...rating, calcRatingPoint}
    if (infoRatingPoint) rating = {...rating, infoRatingPoint}
    if (downtimeRatingPoint) rating = {...rating, downtimeRatingPoint}
    return rating;
}

module.exports.AddedUser = function(body) {
    const { type, name, investigatorId, date } = body;
    let user = {
        type,
        name,
        investigatorId,
        date,
        phones: AddedPhones(body)
    };
    const data = Classifier(body)
    user = {...user, ...data};
    return user;
};

function Classifier(body) {
    const {type, ratingPoint, calcRatingPoint, infoRatingPoint, downtimeRatingPoint} = body;
    let data = {}
    switch (type) {
        case userType.DISPATCHER:
            data = fillDispatcher(ratingPoint)
            break;
        case userType.CARRIER:
            data = fillCarrier(ratingPoint)
            break;
        case userType.TRADER:
            data = fillTrader(calcRatingPoint, infoRatingPoint, downtimeRatingPoint)
            break;
    }
    return data;
}

function fillDispatcher(rating) {
    const data = {
        rating: {
            "point1": 0,
            "point2": 0,
            "point3": 0,
            "point4": 0,
            "point5": 0
        }
    }
    data.rating["point" + rating] = 1
    return data
}

function fillCarrier(rating) {
    const data = {
        rating: {
            "point1": 0,
            "point2": 0,
            "point3": 0,
            "point4": 0,
            "point5": 0
        }
    }
    data.rating["point" + rating] = 1
    return data
}

function fillTrader(calcRatingPoint, infoRatingPoint, downtimeRatingPoint) {
    const data = {
        Calculation: {
            "point1": 0,
            "point2": 0,
            "point3": 0,
            "point4": 0,
            "point5": 0
        },
        InformativenessUnloading: {
            "point1": 0,
            "point2": 0,
            "point3": 0,
            "point4": 0,
            "point5": 0
        },
        Downtime: {
            "point1": 0,
            "point2": 0,
            "point3": 0,
            "point4": 0,
            "point5": 0
        }
    }

    if (calcRatingPoint) data.Calculation["point" + calcRatingPoint] = 1;
    if (infoRatingPoint) data.InformativenessUnloading["point" + infoRatingPoint] = 1;
    if (downtimeRatingPoint) data.Downtime["point" + downtimeRatingPoint] = 1;

    return data
}

function AddedPhones(body) {
    const { phone, additionalNumbers } = body;
    const phones = [];
    const number = {
        phone
    }
    phones.push(number)
    additionalNumbers.map(item => {
        phones.push({phone: item})
    })
    return phones;
}