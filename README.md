# spotify-now-playing
A browser source showing your currently playing Spotify track for use in streaming through software like OBS.

# Using the plugin in OBS (subject to improvements)
1. Go to https://spotify.aryu.dev/
2. Log in using your Spotify account, and click accept.
3. You will now be redirected back to https://spotify.aryu.dev/ but with an access token and refresh token in the url. Copy this full url.
4. Create a new browser source in OBS, paste in the link in the URL field, set width to 428, and height to 168
5. Enjoy!

# Installing the server

0. Install [Node.js](https://nodejs.org/en/)
1. Clone the repository
2. Install dependencies using ``npm i``
3. Set up an application in the [Spotify developer platform](https://developer.spotify.com/dashboard/applications), and add ``https://localhost/callback`` to the list of Redirect URIs
4. Create a certificate and private key. If running locally, using [OpenSSL](https://www.openssl.org/) to create a self-signed certificate will suffice. If hosting the application online, I recommend using [Let's Encrypt](https://letsencrypt.org/getting-started/) through [certbot](https://certbot.eff.org/)
5. Copy ``src/config.example.js`` to ``config.js`` and fill in ``client_id`` and ``client_secret`` found in the dashboard for your Spotify application, as well as changing ``privateKeyPath`` and ``certificatePath`` to point to the certificate and key you just created.
6. Done! Run using ``npm start``
