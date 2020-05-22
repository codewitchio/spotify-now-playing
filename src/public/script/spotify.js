$(function () {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      let hashParams = {};
      let e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }
    
    let params = getHashParams();
    let access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('Authentication failed')
    } else {
        if (access_token) {
            console.log('access token is set')
            
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                  console.log(response)
                }
            });
        }
    }

    // Can't get CORS to work with this
    function getNowPlaying(access_token) {
        url = 'https://api.spotify.com/v1/me/player/currently-playing'
        options = {
            mode: 'cors',
            headers: {
                'Authentication': `Bearer ${access_token}`,
                'Access-Control-ALlow-Origin': '*'
            }
        }
        return fetch(url, options)
    }
});