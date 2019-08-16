//////////////////////////////////////////
/////////TEMPORARY OBJECT TO EXPORT//////
////////////////////////////////////////
const ExportVar = {};

/*importing models*/
var campaign = require('../../models/campaign');
var campaign = require('../../models/campaign');
var moment = require('moment');


/*addCampaign*/

ExportVar.addCampaign = function(req, res) {

    var name = req.body.name;
    var description = req.body.description ? req.body.description : "";

    if (!name) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    let data = {};
    data.name = name;
    data.description = description;
    data.status = 1;
    data.created_at = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    campaign.create(data)
        .then(response => {
            if (req.userdet.auth_token_regeneration == 1) {
                response.auth_token_regeneration = 1;
                response.authtoken = req.userdet.authtoken;
                return res.send(response);
            } else {
                response.auth_token_regeneration = 0;
                return res.send(response);
            }

        }).catch(error => {
            return res.send(error);
        });
}

ExportVar.listCampaign = function(req, res) {

    campaign.campaignDetails({})
        .then(response => {
            if (req.userdet.auth_token_regeneration == 1) {
                response.auth_token_regeneration = 1;
                response.authtoken = req.userdet.authtoken;
                return res.send(response);
            } else {
                response.auth_token_regeneration = 0;
                return res.send(response);
            }
        }).catch(error => {
            return res.send(error);
        });

}

ExportVar.getCampaignDetails = function(req, res) {
    var id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });
    }

    campaign.campaignDetails({ id: id })
        .then(response => {
            if (req.userdet.auth_token_regeneration == 1) {
                response.auth_token_regeneration = 1;
                response.authtoken = req.userdet.authtoken;
                return res.send(response);
            } else {
                response.auth_token_regeneration = 0;
                return res.send(response);
            }
        }).catch(error => {
            return res.send(error);
        });

}

ExportVar.updateCampaign = function(req, res) {

    let id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    let where = {};
    where.id = id;

    let set = {
        'name': req.body.name,
        'description': req.body.description ? req.body.description : "",
        "updated_at": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    campaign.update(where, set)
        .then(response => {
            if (req.userdet.auth_token_regeneration == 1) {
                response.auth_token_regeneration = 1;
                response.authtoken = req.userdet.authtoken;
                return res.send(response);
            } else {
                response.auth_token_regeneration = 0;
                return res.send(response);
            }
        }).catch(error => {
            return res.send(error);
        });

}

ExportVar.changeCampaignStatus = function(req, res) {

    let id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    let where = {};
    where.id = id;

    let set = {
        'status': (req.body.status == 1 || req.body.status == 0) ? req.body.status : 1,
        "updated_at": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    campaign.update(where, set)
        .then(response => {
            if (req.userdet.auth_token_regeneration == 1) {
                response.auth_token_regeneration = 1;
                response.authtoken = req.userdet.authtoken;
                return res.send(response);
            } else {
                response.auth_token_regeneration = 0;
                return res.send(response);
            }
        }).catch(error => {
            return res.send(error);
        });

}


ExportVar.deleteCampaign = function(req, res) {

    let id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    let where = {};
    where.id = id;



    campaign.deleteCampaign(where)
        .then(response => {
            if (req.userdet.auth_token_regeneration == 1) {
                response.auth_token_regeneration = 1;
                response.authtoken = req.userdet.authtoken;
                return res.send(response);
            } else {
                response.auth_token_regeneration = 0;
                return res.send(response);
            }
        }).catch(error => {
            return res.send(error);
        });

}

//////////////////////////CAMPAIGN TO USER ASSIGNMENT AND MANAGEMENT ////////////////////////////////////


// ExportVar.addCampaignToBp = function(req, res) {


//     if (!req.body.campaign_id || !req.body.user_id) {
//         return res.send({ status: 404, message: "parameters are missing" });
//     }
//     let data = {};
//     data.campaign_id = req.body.campaign_id;
//     data.user_id = req.body.user_id;
//     data.created_at = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

//     campaign.addCampaignToBp(data)
//         .then(response => {
//             if (req.userdet.auth_token_regeneration == 1) {
//                 response.auth_token_regeneration = 1;
//                 response.authtoken = req.userdet.authtoken;
//                 return res.send(response);
//             } else {
//                 response.auth_token_regeneration = 0;
//                 return res.send(response);
//             }

//         }).catch(error => {
//             return res.send(error);
//         });

// }

// //////////////////////////////////////////////////////////////////////////////

// ExportVar.updateCampaignToBp = function(req, res) {

//     let id = req.body.id;
//     if (!id) {
//         return res.send({ status: 404, message: "parameters are missing" });
//     }
//     let where = {};
//     where.id = id;

//     let set = {
//         'campaign_id': req.body.campaign_id,
//         'user_id': req.body.user_id,
//         "updated_at": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
//     };

//     campaign.editCampaignToBp(where, set)
//         .then(response => {
//             if (req.userdet.auth_token_regeneration == 1) {
//                 response.auth_token_regeneration = 1;
//                 response.authtoken = req.userdet.authtoken;
//                 return res.send(response);
//             } else {
//                 response.auth_token_regeneration = 0;
//                 return res.send(response);
//             }
//         }).catch(error => {
//             return res.send(error);
//         });

// }

// //////////////////////////////////////////////////////////////

// ExportVar.deleteCampaignToBp = function(req, res) {

//     let id = req.body.id;
//     if (!id) {
//         return res.send({ status: 404, message: "parameters are missing" });
//     }
//     let where = {};
//     where.id = id;



//     campaign.deleteCampaignForBp(where)
//         .then(response => {
//             if (req.userdet.auth_token_regeneration == 1) {
//                 response.auth_token_regeneration = 1;
//                 response.authtoken = req.userdet.authtoken;
//                 return res.send(response);
//             } else {
//                 response.auth_token_regeneration = 0;
//                 return res.send(response);
//             }
//         }).catch(error => {
//             return res.send(error);
//         });

// }

////////////////////////////////////////
///////////EXPORTING TEMPORARY OBJECT//
//////////////////////////////////////
module.exports = ExportVar;