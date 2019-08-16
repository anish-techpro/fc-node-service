/*requiring schemas*/
var User = require('../config/schemas').super_user;

const saltedMd5 = require('salted-md5');
const salt = '!@_trobots_$#';

/*insert query*/
function create(data) {
    data.user_pass = saltedMd5(data.user_pass, salt);
    return new Promise(
        function(resolve, reject) {
            User.create(data)
                .then((result) => {
                    if (result.length == 0) {
                        reject({ "status": "0", "message": "data not inserted." });
                    } else {
                        resolve({ "status": "1", "result": result, "message": "success" });
                    }
                }).catch((err) => {
                    reject({ "status": "0", "error": err });
                });
        });
}


function logincheck(data) {
    // Get salted MD5. 
    //console.log(data);
    data.user_pass = saltedMd5(data.user_pass, salt);
    //console.log(data);
    return new Promise(
        function(resolve, reject) {
            User.findAll({
                    where: data,
                    attributes: { exclude: ['user_pass'] }
                })
                .then((result) => {
                    //console.log(result);
                    if (result.length == 0) {
                        reject({ "status": "404", "message": "credentials are incorrect!." });
                    } else {
                        resolve({ "status": "1", "user": result[0], "message": "success" });
                    }
                }).catch((err) => {
                    reject({ "status": "0", "error": err });
                });
        });
}


function userexists(data) {
    return new Promise(
        function(resolve, reject) {
            //console.log(data);
            User.count({ where: data })
                .then((result) => {
                    //console.log(result);
                    if (result == 0) {
                        resolve({ "status": "404", "message": "user does not exist" });
                    } else {
                        reject({ "status": "0", "result": result, "message": "This email is already registered!" });
                    }
                }).catch((err) => {
                    reject({ "status": "0", "error": err });
                });
        });
}

function update(where, set) {
    return new Promise(
        function(resolve, reject) {
            User.update(set, { where: where })
                .then((result) => {
                    if (result.length == 0) {
                        reject({ status: 0, msg: "cannot update." });
                    } else {
                        resolve({ status: 1, msg: "updated successfully " });
                    }
                })
                .catch((error) => {
                    reject({ "status": "0", "error": error });
                });
        });
}

function changepassword(userid, oldpwd, newpwd) {
    var oldpwd = saltedMd5(oldpwd, salt);
    var newpwd = saltedMd5(newpwd, salt);
    return new Promise(
        function(resolve, reject) {
            /*check old password*/
            var findcond = { id: userid, password: oldpwd };
            User.findOne({ where: findcond })
                .then((result) => {
                    //console.log(result);
                    if (!result) {
                        reject({ "status": "0", "msg": "your password is not correct" });
                    } else {
                        /*change new password*/
                        var set = { password: newpwd };
                        User.update(set, { where: findcond })
                            .then((result) => {
                                if (result.length == 0) {
                                    reject({ status: 0, msg: "cannot update." });
                                } else {
                                    resolve({ status: 1, msg: "updated successfully " });
                                }
                            })
                            .catch((error) => {
                                reject({ "status": "0", "error": error });
                            });
                    }
                }).catch((error) => {
                    reject({ "status": "0", "msg": "error in finding user please try again" });
                });
        });
}

/*exporting all functions*/
module.exports = {
    create: create,
    logincheck: logincheck,
    userexists: userexists,
    update: update,
    changepassword: changepassword
};