/** 
 * Project:     spotify-now-playing
 * Repository:  https://github.com/Aryuko/spotify-now-playing/
 * Author:      Aryuko
 * Version:     0.0.2
*/

const fs            = require('fs')
const path          = require('path')
const express       = require('express')
const app           = express()
const https         = require('https')
const cookieParser  = require('cookie-parser')
const cors          = require('cors')

const config        = require('./config.js')
const auth          = require('./authentication.js')

const publicPath = path.join(__dirname, '/public')
const certsPath = path.join(__dirname, '/certs')

app.use(express.static(publicPath)).use(cookieParser()).use(cors())

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/html/index.html')))
app.get('/player', (req, res) => res.sendFile(path.join(__dirname, '/public/html/player.html')))
app.get('/login', (req, res) => auth.login(req, res))
app.get('/callback', (req, res) => auth.callback(req, res))
app.get('/refresh_token', (req, res) => auth.refresh_token(req, res))

let privateKey = fs.readFileSync(path.join(certsPath, config.server.privateKeyPath))
let certificate = fs.readFileSync(path.join(certsPath, config.server.certificatePath))

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(config.server.port, () => console.log('listening on', config.server.port))
