var Users = require('../config/schemas').Users;

const exportObj = {};

exportObj.getById = (id) => {
    return new Promise(
        function (resolve, reject) {
            Users.findOne({ where: { id }, raw: true })
                .then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject({ error: "Error while fetching video room!" });
                });
        });
}

module.exports = exportObj;