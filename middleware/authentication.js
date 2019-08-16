//////////////////////////////////////////
/////////TEMPORARY OBJECT TO EXPORT//////
////////////////////////////////////////
const ExportVar = {};

var superadmin_logs = require('../models/superadmin_logs');
var moment = require('moment');
var crypto = require('crypto');
var fs = require('fs');

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

ExportVar.auth = function(req, res, next) {

    // console.log(req.body);
    if (req.headers.authtoken) {
        if (!req.body.user_type) {
            if (req.file && req.file.path) {
                fs.unlink(req.file.path);
            }

            return res.send({ status: 404, message: "User type not provided!" });
        }


        switch (Number(req.body.user_type)) {
            case 1:
                superAdminAuthcheck(req, res, next);
                break;
            case 2:
                bpAuthcheck(req, res, next);
                break;
            case 3:
                subBpAuthCheck(req, res, next);
                break;
            case 4:
                agentAuthCheck(req, res, next);
                break;
            default:
                return res.send({ status: 404, message: "User type is incorrect!" });
        }




    } else {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path);
        }
        return res.send({ status: 404, message: "session expired,please login again!" });
    }
}
//////////////////////////AUTH CHECK AND REGERATION FOR SUPERADMIN /////////////////////////////////
function superAdminAuthcheck(req, res, next) {

    var authtoken = req.headers.authtoken;

    superadmin_logs.authenticate({ authtoken: authtoken, status: 1 })
        .then(response => {

            // req.userdet = response.user.toJSON();

            if (moment(new Date()) > moment(response.user.expire_time)) { //TOKEN EXPIRED  REGENERATING
                var authToken = uniqueId();
                var current_time = moment().format("YYYY-MM-DD HH:mm:ss");
                var expire_time = moment(current_time).add(1440, 'minutes').format("YYYY-MM-DD HH:mm:ss");
                superadmin_logs.regeneratetoken({ token_detais: response.user, authtoken: authToken, expire_time: expire_time })
                    .then(response_data => {
                        response.user.auth_token_regeneration = 1;
                        response.user.authtoken = authToken;
                        response.user.expire_time = moment(expire_time).format("YYYY-MM-DD HH:mm:ss");

                        req.userdet = response.user;
                        next();

                    }).catch(err => {
                        if (req.file && req.file.path) {
                            fs.unlink(req.file.path);
                        }

                        return res.send(err);

                    });

            } else { //TOKEN DID NOT EXPIRE 
                response.user.auth_token_regeneration = 0;
                response.user.expire_time = moment(response.user.expire_time).format("YYYY-MM-DD HH:mm:ss");
                req.userdet = response.user;
                next();
            }

        }).catch(error => {
            if (req.file && req.file.path) {
                fs.unlink(req.file.path);
            }
            return res.send(error);
        });

}
/////////////////////////////////////////////////////////////////////////////////////////////////////
function bpAuthcheck(req, res, next) {

    return res.send({ status: 1, message: "Under Progress!" });


}

function subBpAuthCheck(req, res, next) {

    return res.send({ status: 1, message: "Under Progress!" });


}

function agentAuthCheck(req, res, next) {

    return res.send({ status: 1, message: "Under Progress!" });


}


module.exports = ExportVar;