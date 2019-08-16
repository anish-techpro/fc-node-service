
/*requiring schemas*/
var USERDEVICES = require('../config/schemas').superadmin_logs;
/*other schemas to join*/
var User = require('../config/schemas').super_user;
var moment = require('moment');

/*relationships*/
USERDEVICES.belongsTo(User, { foreignKey: 'userid' });
//var crypto = require('crypto');




/*insert query*/
function createfn(data) {
    return new Promise(
        function (resolve, reject) {
            USERDEVICES.create(data)
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



/*update query*/
function updateForuserSession(wherecond, data) {
    return new Promise(
        function (resolve, reject) {
            USERDEVICES.update(data, { where: wherecond })
                .then((result) => {
                    resolve({ "status": "1", "message": "success" });
                })
                .catch((err) => {
                    reject({ "status": "0", "error": err });
                });
        })
}

function deleteUserSession(wherecond, data) {
    return new Promise(
        function (resolve, reject) {
            USERDEVICES.destroy({ where: data })
                .then((result) => {
                    resolve({ status: 1, msg: "Success" });
                })
                .catch((error) => {
                    reject({ "status": "0", "error": error });
                });
        });
}





/* SELECT QUERY */
function selectForuserSession(res, data, next) {
    return new Promise(
        function (resolve, reject) {
            var access_token = data.auth_token;
            var currentDate = new Date();
            var timestamp = currentDate.getTime();
            var where = { 'auth_token': access_token, 'status': 1 };
            var wherecond = { 'auth_token': access_token, 'status': 1 };
            USERDEVICES.findOne({ where: where })
                .then((return_user_ses) => {
                    if (!return_user_ses) {
                        USERDEVICES.findOne({ where: wherecond })
                            .then((exp_user_ses) => {
                                if (!exp_user_ses) {
                                    resolve({ status: 2, msg: "Invalid token." });
                                } else {
                                    var datatosend = {};
                                    datatosend.status = 0;
                                    updateForuserSession(wherecond, datatosend);

                                    exp_user_ses.is_expire = 1;
                                    resolve(exp_user_ses);
                                }
                            }).catch((error) => {
                                reject({ "status": "0", "error": error });
                            });
                    } else {
                        var datatosend = {};
                        datatosend.totalcall = parseInt(return_user_ses.totalcall) + 1;
                        updateForuserSession(wherecond, datatosend);
                        return_user_ses.is_expire = 0;
                        resolve(return_user_ses);
                    }
                });
        });
}

function logout(where) {
    return new Promise(
        function (resolve, reject) {
            // USERDEVICES.update(set, { where : where })
            // .then((result) => {
            USERDEVICES.destroy({ where: where }).then(function (result) {
                // if (result.length == 0) {
                //     reject({ status: 0 , msg: "Invalid token."});
                // } else {
                resolve({ status: "1", msg: "logged  out  successfully!" });
                // }
            })
                .catch((error) => {
                    reject({ "status": "0", "error": error });
                });
        });
}

function authenticate(data) {
    return new Promise(
        function (resolve, reject) {
            USERDEVICES.findOne({
                where: data,
                include: [{
                    'model': User
                }]
            })
                .then((result) => {
                    if (!result) {
                        reject({ status: "2", msg: "Session expired . Please login again." });
                    } else {
                        result= JSON.parse(JSON.stringify(result));
                        result.super_user.user_pass = undefined;
                        resolve({ user: result });
                       
                    }
                })
                .catch((error) => {
                    reject({ "status": "0", "error": error });
                });
        });
}




function regeneratetoken(data) {

    return new Promise(
        function (resolve, reject) {
            var access_token = data.token_detais.authtoken;
            var wherecond = { 'authtoken': access_token, 'status': 1 };
            var datatosave = {};
           

            datatosave.authtoken = data.authtoken;
            datatosave.status = 1;
            datatosave.expire_time = data.expire_time;
            datatosave.totalcall = 0;

            USERDEVICES.update(datatosave, { where: wherecond})
                .then((result) => {
                    if (result.length == 0) {
                        reject({ status:"0", msg: "Could not update token" });
                    } else {
                        console.log(result);
                        resolve({ user: data });
                    }
                })
                .catch((error) => {
                    reject({ "status": "0", "error": error,  msg: "Token Regeneration Failed!" });
                });
        });
}




/*exporting all functions*/
module.exports = {
    create: createfn,
    logout: logout,
    authenticate: authenticate,
    updateForuserSession: updateForuserSession,
    deleteUserSession: deleteUserSession,
    regeneratetoken: regeneratetoken,
    selectForuserSession: selectForuserSession
};
