const express = require('express');
const router = express.Router();
module.exports = router ;

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

module.exports.AddedUser = function(body) {
    const { type, name, ratingPoint, calcRatingPoint, infoRatingPoint, downtimeRatingPoint, investigatorId, date } = body;
    let user = {};
    if (type) user = {...user, type};
    if (name) user = {...user, name};
    if (ratingPoint) user = {...user, ratingPoint};
    if (calcRatingPoint) user = {...user, calcRatingPoint};
    if (infoRatingPoint) user = {...user, infoRatingPoint};
    if (downtimeRatingPoint) user = {...user, downtimeRatingPoint};
    if (investigatorId) user = {...user, investigatorId};
    if (date) user = {...user, date};
    return user;
};

module.exports.AddedPhones = function(body) {
    const { phone, additionalNumbers } = body;
    let user = {
        phones: [],
    };
    const number = {
        phone
    }
    user.phones.push(number)
    additionalNumbers.map(item => {
        user.phones.push({phone: item})
    })
    return user;
};