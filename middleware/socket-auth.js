const jwt = require('jsonwebtoken');

const VideoRoom = require('models/video-room');
const User = require('models/user');
const room = require('lib/room');

module.exports = async (socket, next) => {
    const token = socket.handshake.query && socket.handshake.query.token;
    const roomId = socket.handshake.query && socket.handshake.query.roomId;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err || !decoded) {
            next(new Error('Invalid Token'));
        } else {
            const userId = decoded.sub;
            const videoRoom = await VideoRoom.getById(roomId);
            const user = await User.getById(userId);
            const moment = require('moment');
            const now = moment();
            if (!videoRoom || !videoRoom.publish) {
                next(new Error('Session does not exist.'));
                return;
            }
            const isParticipant = (videoRoom.consumers.includes(userId) || videoRoom.host_id == userId);
            const sessionHasStarted = moment(videoRoom.start_at).isSameOrBefore(now);
            const sessionHasNotEnded = moment(videoRoom.start_at).add(videoRoom.duration, 'hours').isSameOrAfter(now);
            const isValid = isParticipant && sessionHasStarted && sessionHasNotEnded;
            let error = null;
            if (isValid) {
                const roomExist = await room.roomExist(roomId);
                if (!roomExist) {
                    await room.createRoom(roomId, videoRoom.host_id);
                    await room.addPeerToRoom(roomId, userId);
                } else {
                    const userAddedToRoom = await room.hasPeer(roomId, userId);
                    if (!userAddedToRoom) {
                        await room.addPeerToRoom(roomId, userId);
                    } else {
                        error = {
                            type: 'ALREADY_IN_SESSION',
                            message: 'You are already in a session.'
                        };
                    }
                }
                // socket.id = userId;
                socket.info = {
                    roomId,
                    user,
                    error
                }
                next();
            } else if (!isParticipant) {
                next(new Error('You are not a participant.'))
            } else if (!sessionHasStarted) {
                next(new Error('Session has not started yet.'));
            } else if (!sessionHasNotEnded) {
                next(new Error('Session has already been ended.'));
            } else {
                next(new Error());
            }
        }
    });
};