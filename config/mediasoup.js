const os = require('os');


module.exports = {
    listenIp: process.env.IP,
    listenPort: process.env.PORT,
    sslCrt: process.env.SSL_CRT_PATH,
    sslKey: process.env.SSL_KEY_PATH,
    mediasoup: {
        numWorkers: Object.keys(os.cpus()).length,
        // Worker settings
        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
            logLevel: 'warn',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
                // 'rtx',
                // 'bwe',
                // 'score',
                // 'simulcast',
                // 'svc'
            ],
        },
        // Router settings
        router: {
            mediaCodecs:
                [
                    {
                        kind: 'audio',
                        mimeType: 'audio/ISAC',
                        clockRate: 32000
                    },
                    {
                        kind: 'video',
                        mimeType: 'video/VP8',
                        clockRate: 90000,
                        parameters:
                        {
                            'x-google-start-bitrate': 1000
                        }
                    },
                ]
        },
        // WebRtcTransport settings
        webRtcTransport: {
            listenIps: [
                { ip: process.env.IP, announcedIp: process.env.IP }
            ],
            maxIncomingBitrate: 1500000,
            initialAvailableOutgoingBitrate: 1000000,
        }
    }
};
