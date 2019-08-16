//////////////////////////////////////////
/////////TEMPORARY OBJECT TO EXPORT//////
////////////////////////////////////////
const ExportVar = {};

/*importing libraries*/
//var fs = require('fs');
var async = require("async");
var crypto = require('crypto');
//var moment = require('moment');

/*importing models*/
var superadmin_logs = require('../../models/superadmin_logs');




/*
|---------------------------------------------------
| all local methods
|--------------------------------------------------- 
*/


function superAdminLogout(req, res) {
  //  return res.send(req.userdet);
    var authtoken = req.headers.authtoken;
    var userid = req.userdet.userid;

    superadmin_logs.logout({ authtoken: authtoken, userid: userid, status: 1 })
        .then(response => {
            return res.send(response);
           
        }).catch(error => {
            return res.send(error);
        });

}

/*
|---------------------------------------------------
| Methods from middleware - ROUTING
|--------------------------------------------------- 
*/


/////////////////////LOGOUT///////////////////////////////


ExportVar.logout = function (req, res) {

   // return res.send( req.userdet  );
 //   var auth_token = req.body.auth_token;
    var user_type = req.body.user_type;


    switch (Number(req.body.user_type)) {
        case 1:
            superAdminLogout(req, res);
            break;
        case 2:
            bpLogout(req, res);
            break;
        case 3:
            subBpLogout(req, res);
            break;
        case 4:
            agentLogout(req, res);
            break;
        default:
            return res.send({ status: 0, message: "User type is incorrect!" });
    }


}











////////////////////////////////////////
///////////EXPORTING TEMPORARY OBJECT//
//////////////////////////////////////
module.exports = ExportVar;