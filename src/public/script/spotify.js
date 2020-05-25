config = {
    interval: 3000,
    totalWidth: 428
}

$(function () {
    let params = getHashParams()
    let access_token = params.access_token
    let refresh_token = params.refresh_token
    let error = params.error
    
    let interval
    
    if (error) {
        alert('Authentication failed')
    } else if (!refresh_token) {
        $('#title-area').hide()
        $('#output').hide()
        $('#login-area').css('display', 'flex')
    } else {
        if (access_token || refresh_token) {
            getNowPlaying()
            interval = setInterval(getNowPlaying, config.interval);
        }
    }
    
    function getNowPlaying() {
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token },
            success: (response, status, jqXHR) => updateUI(response, jqXHR),
            error: (jqXHR) => { if(jqXHR.status == 401) { refreshToken() } }
        })
    }
    
    let previousProgress = 9999999999
    function updateUI(response, jqXHR) {
        console.log(response, jqXHR)
        if (jqXHR.status == 200 && response) {
            let isPlaying = response.is_playing
            $('#title').text(isPlaying ? 'Now playing' : 'Paused')
            if (isPlaying) {
                $('#album-icon').addClass('rotating')
            } else {
                $('#album-icon').removeClass('rotating')
            }
            
            let imgUrl = response.item.album.images[1].url
            let trackName = response.item.name
            let artistName = response.item.artists[0].name
            
            $('#album-art').attr('src', imgUrl)
            $('#track-name').text(trackName)
            $('#artist-name').text(artistName)
    
            let duration = response.item.duration_ms
            let progress = response.progress_ms
            let progressTarget = Math.min(progress + config.interval, duration)
    
            let part = progressTarget/duration
            let partTarget = progressTarget/duration
    
            let actualWidth = Math.floor(part * config.totalWidth)
            let widthTarget = Math.floor(partTarget * config.totalWidth)
    
            // Snap instantly into place if distance is greater than natural, indicating a skip, then continue as usual
            let distance = Math.abs(progress - previousProgress)
            if(distance > 3500) { $('#progress-bar').width(actualWidth) } 
    
            $('#progress-bar').animate({width: widthTarget}, (config.interval - 100))
           
            previousProgress = progress
        } else if (jqXHR.status == 200 && !response) { // No available devices found
            resetUI()
            $('#title').text('No available devices found')
        } else if (jqXHR.status == 204) { // No song playing or user in private session
            resetUI()
            $('#title').text('No song playing')
        } 
        
    }

    function resetUI() {
        $('#album-icon').removeClass('rotating')
        $('#title').text('Loading')
        $('#track-name').text('')
        $('#artist-name').text('')
        $('#progress-bar').width(0)
        if($('#album-art').attr('src') != 'images/confuseddoggo.gif') {
            $('#album-art').attr('src', 'images/confuseddoggo.gif')
        }
    }
    
    function refreshToken() {
        $.ajax({
            url: '/refresh_token',
            data: {
                'refresh_token': refresh_token
            }
        }).done(function(data) {
            access_token = data.access_token
            
            getNowPlaying(access_token)
        })
    }
    
    /**
    * Obtains parameters from the hash of the URL
    * @return Object
    */
    function getHashParams() {
        let hashParams = {}
        let e, r = /([^&=]+)=?([^&]*)/g,
        q = window.location.hash.substring(1)
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2])
        }
        return hashParams
    }
    
    // Can't get CORS to work with this
    function fetchNowPlaying(access_token) {
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
})