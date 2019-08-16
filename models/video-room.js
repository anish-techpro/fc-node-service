var VideoRooms = require('../config/schemas').VideoRooms;
var VideoRoomTextChats = require('../config/schemas').VideoRoomTextChats;

const exportObj = {};

exportObj.getById = (id) => {
    return new Promise(
        function (resolve, reject) {
            VideoRooms.findOne({ where: { id }, raw: true })
                .then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject({ error: "Error while fetching video room!" });
                });
        });
}

exportObj.saveMessage = (userId, roomId, msg) => {
    return new Promise(
        function (resolve, reject) {
            VideoRoomTextChats.create({
                user_id: userId,
                video_room_id: roomId,
                msg: msg
            })
                .then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject({ error: "Error while fetching video room!" });
                });
        });
}

module.exports = exportObj;