/** 
 * Project:     spotify-now-playing
 * Repository:  https://github.com/Aryuko/spotify-now-playing/
 * Author:      Aryuko
 * Version:     0.0.1
*/

const express       = require('express')
const app           = express()
const http          = require('http').createServer(app);
const cookieParser  = require('cookie-parser');
const cors          = require('cors');

const config        = require('./config.js')
const auth          = require('./authentication.js')

app.use(express.static(__dirname + '/public')).use(cookieParser()).use(cors())

app.get('/', (req, res) => res.sendFile(__dirname + '/public/html/index.html'))
app.get('/login', (req, res) => auth.login(req, res))
app.get('/callback', (req, res) => auth.callback(req, res))
app.get('/refresh_token', (req, res) => auth.refresh_token(req, res))

http.listen(config.server.port, () => console.log('listening on', config.server.port))