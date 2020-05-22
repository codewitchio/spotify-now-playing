/** 
 * Project:     spotify-now-playing
 * Repository:  https://github.com/Aryuko/spotify-now-playing/
 * Author:      Aryuko
 * Version:     0.0.1
*/

const express       = require('express')
const app           = express()
const http          = require('http').createServer(app);
const io            = require('socket.io')(http);
const cookieParser  = require('cookie-parser');
const cors          = require('cors');

const config = require('./config.js')
const authentication = require('./authentication.js')

io.on('connection', (socket) => {
    console.log('Client connected:', socket.handshake.headers['user-agent'])
    socket.on('disconnect', () => { console.log('Client disconnected') })

    io.emit('test')
})

app.use(express.static(__dirname + '/public')).use(cookieParser()).use(cors())
app.get('/', (req, res) => res.sendFile(__dirname + '/public/html/index.html'))
app.get('/login', (req, res) => authentication.login(req, res))
app.get('/callback', (req, res) => authentication.callback(req, res))
http.listen(config.server.port, () => console.log('listening on', config.server.port))