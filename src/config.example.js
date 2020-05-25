module.exports = {
    server: {
        port: 8888,
        privateKeyPath: 'server.key',
        certificatePath: 'server.cert'
    },
    spotify: {
        client_id: 'client_id',
        client_secret: 'client_secret',
        redirect_uri: 'redirect_uri',
        scope: 'user-read-private user-read-email user-read-currently-playing'
    }
}