/*requiring schemas*/
var ranks = require('../config/schemas').ranks;
var rank_privileges = require('../config/schemas').rank_privileges;
var rank_to_privileges = require('../config/schemas').rank_to_privileges;
var sequelize = require('../config/database').sequelize;
const Op = sequelize.Op;

/*insert query*/
function create(data) {

    return new Promise(
        function(resolve, reject) {
            ranks.count({ where: { name: data.name } })
                .then((count_result) => {
                    //console.log(result);
                    if (count_result == 0) {

                        ranks.create(data)
                            .then((result) => {
                                if (result.length == 0) {
                                    reject({ "status": "0", "message": "Could not insert data!" });
                                } else {
                                    resolve({ "status": "1", "result": JSON.parse(JSON.stringify(result)), "message": "Success" });
                                }
                            }).catch((err) => {
                                reject({ "status": "0", "error": err, "message": "Failed to insert data!" });
                            });
                        // resolve({ "status": "1", "message": "ranks does not exist" });
                    } else {
                        reject({ "status": "404", "result": count_result, "message": "A rank is already registered with this name!" });
                    }
                }).catch((err) => {
                    reject({ "status": "0", "error": err, "msg": "Error while fetching ranks count !" });
                });
        });
}



// ranks.hasMany(rank_to_privileges, {
//     foreignKey: 'rank_id',
//     // sourceKey: 'id',
//     // targetKey: 'rank_id'
// });

ranks.belongsToMany(rank_privileges, { through: 'rank_to_privileges', foreignKey: 'rank_id', otherKey: 'privilege_id' })


// rank_to_privileges.belongsTo(rank_privileges, {
//     sourceKey: 'privilege_id',
//     targetKey:'id'
// });


// recipe_cartModel.schema.belongsTo(Recipe.recipeModel.schema, {
//     foreignKey: 'recipe_id'
// });

function ranksDetails(data) {

    //  console.log("data",data);
    return new Promise(
        function(resolve, reject) {
            try {
                ranks.findAll({
                        where: data,
                        order: [
                            ['id', 'DESC']
                        ],
                        include: [{
                            model: rank_privileges,
                            required: true

                        }]

                    })
                    .then(function(result) {
                        console.log(result);
                        resolve({ "status": "1", "result": result, "message": "success" });
                    })
                    .catch(function(err) {
                        console.log(err);
                        reject({ "status": "0", "error": err, "message": "Error while fetching ranks!" });
                    });
            } catch (err) {
                console.log(err);
            }

        });

}



function ranksDetailsPaginate(data, page) {

    // let page = req.params.page;      // page number
    let limit = 2; // number of records per page
    let offset = (page - 1) * limit;

    //  db.user.findAndCountAll({
    //      attributes: ['id', 'first_name', 'last_name', 'date_of_birth'],
    //      limit: limit,
    //      offset: offset,
    //      $sort: { id: 1 }
    //  }).then((data) => {
    //    let pages = Math.ceil(data.count / limit);
    //        offset = limit * (page - 1);
    //    let users = data.rows;
    //    res.status(200).json({'result': users, 'count': data.count, 'pages': pages});
    // })
    //  .catch(function (error) {
    //    res.status(500).send('Internal Server Error');
    //   });



    //  console.log("data",data);
    return new Promise(
        function(resolve, reject) {
            try {
                ranks.findAndCountAll({
                        where: data,
                        limit: limit,
                        offset: offset,
                        order: [
                            ['id', 'DESC']
                        ],
                        include: [{
                            model: rank_privileges,
                            //  required: true

                        }],
                        distinct: true

                    })
                    .then(function(result) {
                        let pages = Math.ceil(result.count / limit);
                        //offset = limit * (page - 1);
                        //  console.log(result);
                        resolve({ "status": "1", "result": result, 'count': data.count, 'pages': pages, "message": "success" });
                    })
                    .catch(function(err) {
                        console.log(err);
                        reject({ "status": "0", "error": err, "message": "Error while fetching ranks!" });
                    });
            } catch (err) {
                console.log(err);
            }

        });

}





function ranksExist(data) {

    return new Promise(
        function(resolve, reject) {
            //console.log(data);
            ranks.count({ where: data })
                .then((result) => {
                    //console.log(result);
                    if (result == 0) {
                        resolve({ "status": "1", "message": "rank does not exist" });
                    } else {
                        reject({ "status": "404", "result": result, "message": "A rank is already registered with this name!" });
                    }
                }).catch((err) => {
                    reject({ "status": "0", "error": err, "message": "Error while fetching rank count !" });
                });
        });
}

function update(where, set) {

    return new Promise(
        function(resolve, reject) {
            // console.log(where,set);
            // ranks.count({
            //     where: sequelize.and(
            //         { name: set.name },
            //         { id: { $ne: Number(where.id) } }
            //     )
            // })
            //
            try {
                ranks.count({
                        where: {
                            name: set.name,
                            id: {
                                [Op.ne]: Number(where.id)
                            }
                        }
                    })
                    .then((count_result) => {
                        if (count_result == 0) {
                            ranks.update(set, { where: where })
                                .then((result) => {
                                    if (result.length == 0) {
                                        reject({ status: 0, message: "could not update!" });
                                    } else {
                                        resolve({ status: 1, message: "updated successfully " });
                                    }
                                })
                                .catch((error) => {
                                    reject({ "status": "0", "error": error });
                                });
                        } else {
                            reject({ "status": "404", "result": count_result, "message": "A rank is already registered with this name!" });
                        }
                    }).catch((err) => {
                        reject({ "status": "0", "error": err, "message": "Error while fetching ranks count !" });
                    });
            } catch (err) {
                console.log(err);
            }




        });
}

function deleteRanks(where) {

    return new Promise(
        function(resolve, reject) {

            ranks.destroy({ where: where }).then(function(result) {

                    resolve({ status: "1", message: "Deleted  successfully!", result: result });

                })
                .catch((error) => {
                    reject({ "status": "0", "error": error });
                });
        });
}


//////////////////QUERY FOR rank_to_privileges///////////////////////////


function addRankToPrivileges(data) {

    return new Promise(
        function(resolve, reject) {

            rank_to_privileges.bulkCreate(data).then(function(result) {

                    resolve({ status: "1", message: "added  successfully!", result: result });

                })
                .catch((error) => {
                    reject({ "status": "0", "error": error, "message": "error while bulk creation of rank_to_privileges , but rank created/updated!" });
                });
        });
}

function deleteRankToPrivileges(where) {

    return new Promise(
        function(resolve, reject) {

            rank_to_privileges.destroy({ where: where }).then(function(result) {

                    resolve({ status: "1", message: "Deleted  successfully!", result: result });

                })
                .catch((error) => {
                    reject({ "status": "0", "error": error, "message": "error while deleting  rank_to_privileges" });
                });
        });
}

/////////////////////////////////////////////////////////////////////////


//////////////////QUERY FOR rank_privileges//////////////////////////////

function rankPrivileges(data) {

    return new Promise(
        function(resolve, reject) {
            rank_privileges.findAll({
                    where: data
                })
                .then((result) => {
                    //console.log(result);

                    resolve({ "status": "1", "result": result, "message": "success" });

                }).catch((err) => {
                    reject({ "status": "0", "error": err, "message": "Error while fetching rank privileges!" });
                });
        });
}


////////////////////////////////////////////////////////////////////////////


/*exporting all functions*/
module.exports = {
    create: create,
    ranksDetails: ranksDetails,
    ranksExist: ranksExist,
    update: update,
    deleteRanks: deleteRanks,
    addRankToPrivileges: addRankToPrivileges,
    deleteRankToPrivileges: deleteRankToPrivileges,
    rankPrivileges: rankPrivileges,
    ranksDetailsPaginate: ranksDetailsPaginate
};