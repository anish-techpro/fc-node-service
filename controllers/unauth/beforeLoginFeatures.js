//////////////////////////////////////////
/////////TEMPORARY OBJECT TO EXPORT//////
////////////////////////////////////////
const ExportVar = {};

/*importing libraries*/
//var fs = require('fs');
var async = require("async");
var crypto = require('crypto');
var moment = require('moment');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

/*importing models*/
var super_user = require('../../models/super_user');
 var superadmin_logs = require('../../models/superadmin_logs');


function uniqueId() {
    var current_date = (new Date())
        .valueOf()
        .toString();
    var random = Math.random()
        .toString();
    var token = crypto.createHash('sha1')
        .update(current_date + random)
        .digest('hex');
    return token;
}

/*
|---------------------------------------------------
| all local methods
|--------------------------------------------------- 
*/

/////////////////SIGN UP///////////////////////////////

function userexists_async(data,table_name) {

    return function (callback) {
        table_name.userexists(data)
            .then(result => {
                callback(null);
            }).catch(error => {
                callback(error);
            });
    }
}

function signup_async(signupobject, table_name) {
    return function (callback) {
        table_name.create(signupobject)
            .then(result => {
                callback(null, result);
            }).catch(error => {
                callback(error);
            });
    }
}
function superAdminSignUp(req, res) {

    try{
    var signupobject = {
        'user_email': req.body.email,
        'user_pass': req.body.password,
        'user_name': req.body.name,
        'created_at': moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        'status': 1
    };


        var dataforuserexists = { 'user_email': req.body.email };
    // console.log(signupobject);
    // console.log(dataforuserexists);
    async.waterfall([
        userexists_async(dataforuserexists, super_user),
        signup_async(signupobject, super_user)
    ], function (error, userdetails) {
        if (error) {
            return res.send(error);
        } else {
            return res.send(userdetails);
        }
    });
} catch(err){
    console.log(err);
        return res.send({ status: 0, err: err});
}

}

function bpSignUp(req, res){

    return res.send({ status: 1, message: "Under Progress!" });


}

function subBpSignUp(req, res) {

    return res.send({ status: 1, message: "Under Progress!" });


}
function agentSignUp(req, res) {

    return res.send({ status: 1, message: "Under Progress!" });


}


////////////LOGIN//////////////////////////////

function signin_async(signinobject,table_name) {
    return function (callback) {
        table_name.logincheck(signinobject)
            .then(result => {
                callback(null, result);
            }).catch(error => {
                callback(error);
            });
    }
}

function insertaccess(authtoken,table_name) {
    return function (userdetails, callback) {
        userdetails = JSON.parse(JSON.stringify(userdetails));
        var current_time = moment().format("YYYY-MM-DD HH:mm:ss");
        var expire_time = moment(current_time).add(1440, 'minutes').format("YYYY-MM-DD HH:mm:ss");
        console.log(current_time, expire_time, userdetails.user.id, authtoken);
        var data = {
            userid: userdetails.user.id,
            authtoken: authtoken,
            status: 1,
            login_timestamp: current_time,
            logout_timestamp: "",
            totalcall: 5,
            expire_time: expire_time
        };
        table_name.create(data)
            .then(result => {
                userdetails.user.id = undefined;
                userdetails.user.authtoken = authtoken;
                callback(null, userdetails);
            }).catch(error => {
                callback(error);
            });
    }
}


function superAdminSignIn(req, res) {

    var signinobject = { 'user_email': req.body.email, 'user_pass': req.body.password };
var authtoken = uniqueId();
async.waterfall([
    signin_async(signinobject, super_user),
    insertaccess(authtoken, superadmin_logs)
], function (error, userdetails) {
    if (error) {
        return res.send(error);
    } else {
        return res.send(userdetails);
    }
});

}

function bpSignIn(req, res) {

    return res.send({ status: 1, message: "Under Progress!" });


}

function subBpSignIn(req, res) {

    return res.send({ status: 1, message: "Under Progress!" });


}

function agentSignIn(req, res) {

    return res.send({ status: 1, message: "Under Progress!" });


}

/*
|---------------------------------------------------
| Methods from middleware - ROUTING
|--------------------------------------------------- 
*/

/*register*/
ExportVar.Signup = function (req, res) {

    var email = req.body.email;
    var password = req.body.password;
    var user_name = req.body.name;
    var user_type = req.body.user_type;
    if (!email || !password || !user_name || !user_type) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    
    switch (Number(req.body.user_type)) {
        case 1:
            superAdminSignUp(req, res);
            break;
        case 2:
            bpSignUp(req, res);
            break;
        case 3:
            subBpSignUp(req, res);
            break;
        case 4:
            agentSignUp(req, res);
            break;
        default:
            return res.send({ status: 0, message: "User type is incorrect!" });
    }

}


/*login*/
ExportVar.signin = function (req, res) {
    console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    var user_type = req.body.user_type;
    if (!email || !password || !user_type) {
        return res.send({ status: 404, message: "parameters are missing" });
    }

    switch (Number(req.body.user_type)) {
        case 1:
            superAdminSignIn(req, res);
            break;
        case 2:
            bpSignIn(req, res);
            break;
        case 3:
            subBpSignIn(req, res);
            break;
        case 4:
            agentSignIn(req, res);
            break;
        default:
            return res.send({ status: 0, message: "User type is incorrect!" });
    }



   
}


/*change password*/
function changepassword(req, res) {
    var oldpwd = req.body.old_password;
    var newpwd = req.body.confirm_password;

    if (!oldpwd || !newpwd) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    var userdetails = req.userdet;
    var userid = userdetails.user.id;
    super_user.changepassword(userid, oldpwd, newpwd)
        .then(response => {
            return res.send(response);
        }).catch(error => {
            return res.send(error);
        });
}



////////////////////////////////////////
///////////EXPORTING TEMPORARY OBJECT//
//////////////////////////////////////
module.exports = ExportVar;