const querystring = require('querystring');
const request = require('request');

const config = require('./config.js')

module.exports = {
	login: (req, res) => {
        var state = generateRandomString(16);
        res.cookie(stateKey, state);

        // your application requests authorization
        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: config.spotify.client_id,
                scope: config.spotify.scope,
                redirect_uri: config.spotify.redirect_uri,
                state: state
            })
        );
    },
    callback: (req, res) => {
        // your application requests refresh and access tokens
        // after checking the state parameter
      
        var code = req.query.code || null;
        var state = req.query.state || null;
        var storedState = req.cookies ? req.cookies[stateKey] : null;
      
        if (state === null || state !== storedState) {
          res.redirect('/#' +
            querystring.stringify({
              error: 'state_mismatch'
            }));
        } else {
          res.clearCookie(stateKey);
          var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
              code: code,
              redirect_uri: config.spotify.redirect_uri,
              grant_type: 'authorization_code'
            },
            headers: {
              'Authorization': 'Basic ' + (new Buffer(config.spotify.client_id + ':' + config.spotify.client_secret).toString('base64'))
            },
            json: true
          };
      
          request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
      
              var access_token = body.access_token,
                  refresh_token = body.refresh_token;
      
              // we can also pass the token to the browser to make requests from there
              res.redirect('/#' +
                querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token
                }));
            } else {
              res.redirect('/#' +
                querystring.stringify({
                  error: 'invalid_token'
                }));
            }
          });
        }
    },
    refresh_token: (req, res) => {
        // requesting access token from refresh token
        var refresh_token = req.query.refresh_token;
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: { 'Authorization': 'Basic ' + (new Buffer(config.spotify.client_id + ':' + config.spotify.client_secret).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                res.send({
                    'access_token': access_token
                });
            }
        });
    }
}

var stateKey = 'spotify_auth_state';

var generateRandomString = (length) => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}