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