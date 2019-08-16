const config = require('config/mediasoup');
const { getMediasoupWorker } = require('./worker');

const rooms = new Map();

const peerExists = (room, peerId) => room.peers.get(peerId);

const getRoomById = (roomId) => {
    const room = rooms.get(roomId);

    if (!room) {
        throw new Error(`room ${roomId} was not found in map`);
    }

    return room;
};

const getPeerById = (roomId, peerId) => {
    const room = getRoomById(roomId);
    const peer = room.peers.get(peerId);

    if (!peer) {
        throw new Error(`peer ${peerId} was not found in room`);
    }

    return peer;
};

const joinRoom = (room, peerId) => {
    if (peerExists(room, peerId)) {
        throw new Error('peer already exists');
    }

    const peer = {
        id: peerId,
        producers: new Map(),
        consumers: new Map(),
        transports: new Map()
    };

    room.peers.set(peerId, peer);
    console.log('peer logged in');
};

module.exports.createRoom = async (roomId, creatorId, videoCodec = 'VP8') => {
    if (rooms.has(roomId)) {
        // joinRoom(rooms.get(roomId), creatorId);
        return rooms.get(roomId);
    }

    console.log('createRoom() [roomId:%s, videoCodec:%s', roomId, videoCodec);
    const mediasoupWorker = await getMediasoupWorker();
    const mediaCodecs = config.mediasoup.router.mediaCodecs
        .filter((codec => codec.kind === 'audio' || codec.mimeType.toLowerCase() === `video/${videoCodec.toLowerCase()}`));

    const mediasoupRouter = await mediasoupWorker.createRouter({ mediaCodecs });

    const room = {
        roomId,
        mediasoupRouter,
        creatorId: creatorId,
        peers: new Map(),
    };

    rooms.set(roomId, room);
    // joinRoom(room, creatorId);
    return room;
};

module.exports.isCreator = async (roomId, peerId) => {
    return rooms.has(roomId) && rooms.get(roomId).creatorId === peerId;
};

module.exports.roomExist = async (roomId) => {
    return rooms.has(roomId);
};

module.exports.hasPeer = async (roomId, peerId) => {
    return rooms.has(roomId) && rooms.get(roomId).peers.has(peerId);
};

module.exports.removePeer = async (roomId, peerId) => {
    const hasPeer = await this.hasPeer(roomId, peerId);
    if (hasPeer) {
        const room = rooms.get(roomId);
        const peer = room.peers.get(peerId);
        for (const consumerId of peer.consumers.keys()) {
            peer.consumers.get(consumerId).close();
        }
        for (const producerId of peer.producers.keys()) {
            peer.producers.get(producerId).close();
        }
        for (const transportId of peer.transports.keys()) {
            peer.transports.get(transportId).close();
        }
        rooms.get(roomId).peers.delete(peerId);
    }
};

module.exports.getMediasoupRouter = async (roomId) => {
    return rooms.has(roomId) && rooms.get(roomId).mediasoupRouter;
};

module.exports.addPeerToRoom = async (roomId, peerId) => {
    const room = getRoomById(roomId);
    if (room) {
        if (!room.peers.has(peerId)) {
            joinRoom(room, peerId);
        } else {
            const peer = room.peers.get(peerId);
            for (const consumerId of peer.consumers.keys()) {
                peer.consumers.get(consumerId).close();
            }
            for (const producerId of peer.producers.keys()) {
                peer.producers.get(producerId).close();
            }
            for (const transportId of peer.transports.keys()) {
                peer.transports.get(transportId).close();
            }
            room.peers.set(peerId, {
                id: peerId,
                producers: new Map(),
                consumers: new Map(),
                transports: new Map()
            });
        }
    }
};

module.exports.togglePlayProducer = async (roomId, peerId, play) => {
    const room = getRoomById(roomId);
    if (room) {
        if (room.peers.has(peerId)) {
            const peer = room.peers.get(peerId)
            for (const producerId of peer.producers.keys()) {
                const producer = peer.producers.get(producerId);
                if (play) {
                    producer.resume();
                } else {
                    producer.pause();
                }
            }
        }
    }
};

module.exports.createWebRtcTransport = async (roomId, peerId) => {
    const room = rooms.get(roomId);
    const peer = getPeerById(roomId, peerId);

    const { listenIps, initialAvailableOutgoingBitrate, enableTcp, enableUdp } = config.mediasoup.webRtcTransport;

    const transport = await room.mediasoupRouter.createWebRtcTransport({
        listenIps, enableUdp, enableTcp, initialAvailableOutgoingBitrate
    });

    peer.transports.set(transport.id, transport);

    return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
    };
};

module.exports.connectTransport = async (roomId, peerId, transportId, dtlsParameters) => {
    const peer = getPeerById(roomId, peerId);
    const transport = peer.transports.get(transportId);

    if (!transport) {
        throw new Error(`transport with id ${transportId} does not exist`);
    }

    await transport.connect({ dtlsParameters });
};

module.exports.createProducer = async (roomId, peerId, transportId, kind, rtpParameters) => {
    const peer = getPeerById(roomId, peerId);
    const transport = peer.transports.get(transportId);

    if (!transport) {
        throw new Error(`transport with id ${transportId} does not exist`);
    }

    const producer = await transport.produce({ kind, rtpParameters });

    producer.on('score', (score) => {
        // console.log('[producer:%s] score event [score:%o]', producer.id, score);
    });

    producer.on('videoorientationchange', (videoOrientation) => {
        // console.log('[producer:%s] videoorientationchange [videoorientation:%o', producer.id, videoOrientation);
    });

    producer.once('transportclose', () => {
        console.log('[producer:%s] transportclose', producer.id);
        room.producers.delete(producer.id);
    });

    peer.producers.set(producer.id, producer);

    return { id: producer.id, peerId: peerId };
};

module.exports.createConsumer = async (roomId, consumerPeerId, producerPeerId, transportId, producerId, rtpCapabilities) => {
    console.log('createConsumer() [roomId:%s, consumerPeerId:%s, producerPeerId:%s, transportId:%s, producerId:%s]', roomId, consumerPeerId, producerPeerId, transportId, producerId);
    const room = getRoomById(roomId);
    const peer = getPeerById(roomId, consumerPeerId);

    if (!room || !peer) { return; }

    const otherPeers = [room.creatorId].reduce((ac, peerId) => {
        const producers = [];
        if (room.peers.has(peerId)) {
            const peer = room.peers.get(peerId);
            for (let producerId of peer.producers.keys()) {
                producers.push(peer.producers.get(producerId));
            }
        }
        return ac.concat(producers);
    }, []);
    return Promise.all(
        otherPeers
            .map(async producer => {
                const producerId = producer.id
                if (!room.mediasoupRouter.canConsume({
                    producerId, rtpCapabilities
                })) {
                    return console.log('user cannot consume producer id %s', producerId);
                }

                const transport = peer.transports.get(transportId);

                if (!transport) {
                    throw new Error(`transport with id ${transportId} does not exist`);
                }

                let consumer;

                try {
                    consumer = await transport.consume({
                        producerId, rtpCapabilities
                    });
                } catch (error) {
                    return console.error('transport consume error %o', error);
                }

                peer.consumers.set(consumer.id, consumer);

                consumer.once('transportclose', () => {
                    console.log('[consumer:%s] transportclose', consumer.id);
                    room.consumers.delete(consumer.id);
                });

                consumer.on('producerclose', () => {
                    room.consumers.delete(consumer.id);
                });

                consumer.on('score', score => console.log('[consumer:%s score:%o]', consumer.id, score));

                return {
                    id: consumer.id,
                    producerId,
                    consumerId: consumer.id,
                    peerId: producerPeerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    type: consumer.type,
                }
            })
    );

    // if (!room.mediasoupRouter.canConsume({
    //     producerId, rtpCapabilities
    // })) {
    //     return console.log('user cannot consume producer id %s', producerId);
    // }

    // const transport = peer.transports.get(transportId);

    // if (!transport) {
    //     throw new Error(`transport with id ${transportId} does not exist`);
    // }

    // let consumer;

    // try {
    //     consumer = await transport.consume({
    //         producerId, rtpCapabilities
    //     });
    // } catch (error) {
    //     return console.error('transport consume error %o', error);
    // }

    // peer.consumers.set(consumer.id, consumer);

    // consumer.once('transportclose', () => {
    //     console.log('[consumer:%s] transportclose', consumer.id);
    //     room.consumers.delete(consumer.id);
    // });

    // consumer.on('producerclose', () => {
    //     room.consumers.delete(consumer.id);
    // });

    // consumer.on('score', score => console.log('[consumer:%s score:%o]', consumer.id, score));

    // return {
    //     producerId,
    //     consumerId: consumer.id,
    //     peerId: producerPeerId,
    //     kind: consumer.kind,
    //     rtpParameters: consumer.rtpParameters,
    //     type: consumer.type,
    // }
};

module.exports.checkStatus = (roomId, peerId) => {
    const room = rooms.get(roomId);

    if (!room) {
        throw new Error('[room:%s] was not found', roomId);
    }

    room.peers.delete(peerId);

    if (room.peers.size === 0) {
        console.log('[room:%s] closing due to no more peers', roomId);
        rooms.delete(room.roomId);
    }
};