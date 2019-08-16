const io = require('socket.io');
const auth = require('middleware/socket-auth');
const room = require('lib/room');
const moment = require('moment');
const VideoRoom = require('models/video-room');

module.exports = (httpsServer) => {
    const socketServer = io(httpsServer, {
        serveClient: false,
        path: '/server',
        log: false,
    });

    socketServer
        .use(auth)
        .on('connection', (socket) => {
            console.log('client connected');
            console.log(socket.info);
            assignEvents(socket, socketServer);
        });
};

function assignEvents(socket, io) {
    const events = {
        'user_info': id => {
            console.log('setting user id');
            socket.id = id;
        },

        'connect_error': (err) => {
            console.error('client connection error', err);
        },

        'createRoom': async (data, callback) => {
            await room.createRoom(data.roomId, data.peerId);
            await room.addPeerToRoom(data.roomId, data.peerId);
            callback();
        },

        'sendMessage': async (data, callback) => {
            io.sockets.emit('newMessage', {
                user: socket.info.user,
                message: data.message,
                date: moment().format('YYYY-MM-DD HH:mm:ss')
            });
            await VideoRoom.saveMessage(socket.info.user.id, data.roomId, data.message);
            callback();
        },

        'roomExist': async (data, callback) => {
            const value = await room.roomExist(data.roomId, data.peerId);
            callback(value);
        },

        'joinRoom': async (data, callback) => {
            await room.addPeerToRoom(data.roomId, socket.id);
            callback();
        },

        'isCreator': async (data, callback) => {
            const value = await room.isCreator(data.roomId, socket.id);
            callback(value);
        },

        'getRouterRtpCapabilities': async (data, callback) => {
            const value = await room.getMediasoupRouter(data.roomId);
            callback(value.rtpCapabilities);
        },

        'createTransport': async (data, callback) => {
            const transport = await room.createWebRtcTransport(data.roomId, socket.id);
            callback(transport);
        },

        'connectTransport': async (data, callback) => {
            await room.connectTransport(data.roomId, socket.id, data.transportId, data.dtlsParameters);
            callback();
        },

        'produce': async (data, callback) => {
            const { roomId, kind, transportId, rtpParameters } = data;
            const producer = await room.createProducer(roomId, socket.id, transportId, kind, rtpParameters);
            callback(producer);
            console.log('newProducer');
            socket.broadcast.emit('newProducer');
        },

        'togglePlayProducer': async (data, callback) => {
            const { roomId, play } = data;
            await room.togglePlayProducer(roomId, socket.id, play);
            callback();
        },

        'consume': async (data, callback) => {
            const { roomId, producerPeerId, transportId, producerId, rtpCapabilities } = data;
            const value = await room.createConsumer(roomId, socket.id, producerPeerId, transportId, producerId, rtpCapabilities);
            callback(value);
        },

        'resume': async (data, callback) => {
            callback();
        },

        'removePeerFromRoom': async (data, callback) => {
            console.log('REMOVE_PEER_FROM_ROOM');
            await room.removePeer(data.roomId, socket.id);
            callback();
        },

        'disconnect': async (data, callback) => {
            console.log('client disconnected');
            typeof callback === 'function' && callback();
        }
    };

    Object.keys(events).forEach(event => socket.on(event, events[event]));
}
