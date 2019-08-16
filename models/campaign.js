/*requiring schemas*/
// var campaign = require('../config/schemas').campaign;
// var campaign_to_bp = require('../config/schemas').campaign_to_bp;
var VideoRooms = require('../config/schemas').VideoRooms;


/*insert query*/
// function create(data) {
//     return new Promise(
//         function(resolve, reject) {
//             campaign.count({ where: { name: data.name } })
//                 .then((count_result) => {
//                     //console.log(result);
//                     if (count_result == 0) {

//                         campaign.create(data)
//                             .then((result) => {
//                                 if (result.length == 0) {
//                                     reject({ "status": "0", "message": "Could not insert data!" });
//                                 } else {
//                                     resolve({ "status": "1", "result": result, "message": "Success" });
//                                 }
//                             }).catch((err) => {
//                                 reject({ "status": "0", "error": err, "message": "Failed to insert data!" });
//                             });
//                         // resolve({ "status": "1", "message": "campaign does not exist" });
//                     } else {
//                         reject({ "status": "404", "result": count_result, "message": "A campaign is already registered with this name! Try another name." });
//                     }
//                 }).catch((err) => {
//                     reject({ "status": "0", "error": err, "message": "Error while fetching campaign count !" });
//                 });
//         });
// }


function campaignDetails() {

    return new Promise(
        function (resolve, reject) {
            VideoRooms.findAll({ raw: true })
                .then((result) => {
                    //console.log(result);
                    resolve({ "status": "1", "result": result, "message": "success" });

                }).catch((err) => {
                    reject({ "status": "0", "error": err, "message": "Error while fetching campaigns!" });
                });
        });
}


// function campaignExists(data) {

//     return new Promise(
//         function(resolve, reject) {
//             //console.log(data);
//             campaign.count({ where: data })
//                 .then((result) => {
//                     //console.log(result);
//                     if (result == 0) {
//                         resolve({ "status": "1", "message": "campaign does not exist" });
//                     } else {
//                         reject({ "status": "0", "result": result, "message": "A campaign is already registered with this name!" });
//                     }
//                 }).catch((err) => {
//                     reject({ "status": "0", "error": err, "message": "Error while fetching campaign count !" });
//                 });
//         });
// }

// function update(where, set) {
//     return new Promise(
//         function(resolve, reject) {

//             campaign.count({

//                     where: {
//                         name: set.name,
//                         id: {
//                             [Op.ne]: Number(where.id)
//                         }
//                     }
//                 })
//                 .then((count_result) => {
//                     //console.log(result);
//                     if (count_result == 0) {

//                         campaign.update(set, { where: where })
//                             .then((result) => {
//                                 if (result.length == 0) {
//                                     reject({ status: 0, message: "cannot update." });
//                                 } else {
//                                     resolve({ status: 1, message: "updated successfully " });
//                                 }
//                             })
//                             .catch((error) => {
//                                 reject({ "status": "0", "error": error });
//                             });

//                     } else {
//                         reject({ "status": "404", "result": count_result, "message": "A campaign is already registered with this name! Try another name." });
//                     }
//                 }).catch((err) => {
//                     reject({ "status": "0", "error": err, "message": "Error while fetching campaign count !" });
//                 });
//         });
// }

// function deleteCampaign(where) {
//     return new Promise(
//         function(resolve, reject) {

//             campaign.destroy({ where: where }).then(function(result) {

//                     resolve({ status: "1", message: "Deleted  successfully!", result: result });

//                 })
//                 .catch((error) => {
//                     reject({ "status": "0", "error": error });
//                 });
//         });
// }

//////////////////ASSIGNING CAMPAIGN TO BP ///////////////////////////////

// function addCampaignToBp(data) {

//     return new Promise(
//         function(resolve, reject) {
//             campaign_to_bp.count({ where: { campaign_id: data.campaign_id, user_id: data.user_id } })
//                 .then((count_result) => {
//                     //console.log(result);
//                     if (count_result == 0) {

//                         campaign_to_bp.create(data)
//                             .then((result) => {
//                                 if (result.length == 0) {
//                                     reject({ "status": "0", "message": "Could not insert data!" });
//                                 } else {
//                                     resolve({ "status": "1", "result": result, "message": "Success" });
//                                 }
//                             }).catch((err) => {
//                                 reject({ "status": "0", "error": err, "message": "Failed to insert data!" });
//                             });
//                         // resolve({ "status": "1", "message": "campaign does not exist" });
//                     } else {
//                         reject({ "status": "404", "result": count_result, "message": "This campaign is already assigned to this user" });
//                     }
//                 }).catch((err) => {
//                     reject({ "status": "0", "error": err, "message": "Error while fetching campaign_to_bp table count !" });
//                 });
//         });
// }




// function editCampaignToBp(where, set) {


//     return new Promise(
//         function(resolve, reject) {

//             campaign_to_bp.count({

//                     where: {
//                         campaign_id: set.campaign_id,
//                         user_id: set.user_id,
//                         id: {
//                             [Op.ne]: Number(where.id)
//                         }
//                     }
//                 })
//                 .then((count_result) => {
//                     //console.log(result);
//                     if (count_result == 0) {

//                         campaign_to_bp.update(set, { where: where })
//                             .then((result) => {
//                                 if (result.length == 0) {
//                                     reject({ status: 0, message: "cannot update." });
//                                 } else {
//                                     resolve({ status: 1, message: "updated successfully " });
//                                 }
//                             })
//                             .catch((error) => {
//                                 reject({ "status": "0", "error": error });
//                             });

//                     } else {
//                         reject({ "status": "404", "result": count_result, "message": "This campaign is already assigned to this user.Try another one." });
//                     }
//                 }).catch((err) => {
//                     reject({ "status": "0", "error": err, "message": "Error while fetching campaign_to_bp count !" });
//                 });
//         });


// }

// function deleteCampaignForBp(where) {

//     return new Promise(
//         function(resolve, reject) {

//             campaign_to_bp.destroy({ where: where }).then(function(result) {

//                     resolve({ status: "1", message: "Deleted  successfully!", result: result });

//                 })
//                 .catch((error) => {
//                     reject({ "status": "0", "error": error });
//                 });
//         });
// }



/*exporting all functions*/
module.exports = {
    // create: create,
    campaignDetails: campaignDetails,
    // campaignExists: campaignExists,
    // update: update,
    // deleteCampaign: deleteCampaign,
    // addCampaignToBp: addCampaignToBp,
    // editCampaignToBp: editCampaignToBp,
    // deleteCampaignForBp: deleteCampaignForBp
};