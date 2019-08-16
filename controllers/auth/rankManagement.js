//////////////////////////////////////////
/////////TEMPORARY OBJECT TO EXPORT//////
////////////////////////////////////////
const ExportVar = {};

/*importing models*/
var rank = require('../../models/rank');
var moment = require('moment');
var fs = require('fs');

/*addrank*/

ExportVar.addRank = function(req, res) {

    // console.log(req.body);
    //   console.log(req.file);



    if (!req.body.name || req.body.privileges.length == 0 || !req.body.privileges || !req.body.title) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    if (isNaN(req.body.order)) {

        return res.send({ status: 404, message: "order value should be a number" });
    }

    let data = {};
    data.name = req.body.name;
    req.body.privileges = req.body.privileges.split(",");
    data.title = req.body.title;
    data.description = req.body.description;
    data.order = Number(req.body.order);
    data.status = 1;
    data.created_at = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");


    if (req.file) {
        ///////////////////IF FILE EXISTS//////////////////////////////////////
        var fn_arr = req.file.mimetype.split('/');
        var fntype = fn_arr[0];
        if (fntype != 'image') {
            //////////////////IF TYPE IS NOT IMAGE//////////////////////////////////////////
            fs.unlink(req.file.path);
            return res.send({
                status: "404",
                message: "please upload an image file"
            });
        } else {

            data.logo = req.file.filename;
        }
    }
    try {

        rank.create(data)
            .then(response => {
                // console.log("ret data for rank create");
                //   console.log(response.result);
                try {
                    let rankToPrivilegeData = [];

                    req.body.privileges.forEach(function(val, index) {
                        rankToPrivilegeData.push({ "rank_id": response.result.id, "privilege_id": Number(val) });
                    })

                    rank.addRankToPrivileges(rankToPrivilegeData)
                        .then(addRankToPrivileges_response => {


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
                } catch (err) {
                    console.log(err);
                    return res.send({ status: 0, error: err });
                }


            }).catch(error => {
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path);
                }
                return res.send(error);
            });
    } catch (err) {
        console.log(err);
        //  return res.send(err);
    }


}


////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  LIST ALL RANKS  ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


ExportVar.listRank = function(req, res) {
    // console.log(req.body);
    try {
        rank.ranksDetails({})
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
    } catch (err) {
        console.log(err);
    }
}


// ExportVar.listRank = function(req, res) {
//     // console.log(req.body);
//     try {
//         rank.ranksDetailsPaginate({}, req.body.page)
//             .then(response => {
//                 if (req.userdet.auth_token_regeneration == 1) {
//                     response.auth_token_regeneration = 1;
//                     response.authtoken = req.userdet.authtoken;
//                     return res.send(response);
//                 } else {
//                     response.auth_token_regeneration = 0;
//                     return res.send(response);
//                 }
//             }).catch(error => {
//                 return res.send(error);
//             });
//     } catch (err) {
//         console.log(err);
//     }
// }




ExportVar.getRankDetails = function(req, res) {
    var id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });

    }

    rank.ranksDetails({ id: id })
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
////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  UPDATE RANK  ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

ExportVar.updateRank = function(req, res) {

    let id = req.body.id;
    if (!id || req.body.privileges.length == 0 || !req.body.privileges || !req.body.name) {
        if (req.file) {
            fs.unlink(req.file.path);
        }
        return res.send({ status: 404, message: "parameters are missing" });
    }

    if (isNaN(req.body.order)) {

        return res.send({ status: 404, message: "order value should be a number" });
    }


    let where = {};
    where.id = id;

    req.body.privileges = req.body.privileges.split(",");

    let set = {
        'name': req.body.name,
        'title': req.body.title,
        'description': req.body.description,
        'order': Number(req.body.order),
        "updated_at": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    if (req.file) {
        ///////////////////IF FILE EXISTS//////////////////////////////////////
        var fn_arr = req.file.mimetype.split('/');
        var fntype = fn_arr[0];
        if (fntype != 'image') {
            //////////////////IF TYPE IS NOT IMAGE//////////////////////////////////////////
            fs.unlink(req.file.path);
            return res.send({
                status: 0,
                message: "please upload an image"
            });
        } else {

            set.logo = req.file.filename;
        }
    }

    rank.update(where, set)
        .then(response => {
            let rankToPrivilegeData = { "rank_id": id };
            rank.deleteRankToPrivileges(rankToPrivilegeData)

                .then(deleteRankToPrivileges_response => {

                    let addRankToPrivilegeData = [];

                    req.body.privileges.forEach(function(val, index) {
                        addRankToPrivilegeData.push({ "rank_id": id, "privilege_id": val });
                    })

                    rank.addRankToPrivileges(addRankToPrivilegeData)
                        .then(addRankToPrivileges_response => {

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

                }).catch(error => {
                    return res.send(error);
                });
        }).catch(error => {
            if (req.file) {
                fs.unlink(req.file.path);
            }
            return res.send(error);
        });

}
////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  DEACTIVATE  ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ExportVar.deactivateRank = function(req, res) {

    let id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    let where = {};
    where.id = id;

    let set = {
        'status': req.body.status ? req.body.status : 1,
        "updated_at": moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    rank.update(where, set)
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






ExportVar.deleteRank = function(req, res) {

    let id = req.body.id;
    if (!id) {
        return res.send({ status: 404, message: "parameters are missing" });
    }
    let where = {};
    where.id = id;



    rank.deleteRanks(where)
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



////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  GET ALL PRIVILEGE LIST  ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


ExportVar.getAllPrivileges = function(req, res) {

    rank.rankPrivileges({})
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

////////////////////////////////////////
///////////EXPORTING TEMPORARY OBJECT//
//////////////////////////////////////
module.exports = ExportVar;