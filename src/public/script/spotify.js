// Temporary solution
config = {
    interval: 3000,
    totalWidth: 428,
    debug: false
}

$(function () {
    let params = getHashParams()
    let access_token = params.access_token
    let refresh_token = params.refresh_token
    let error = params.error
    let no_instructions = params.no_instructions
    
    state = {
        interval: undefined,
        previousProgress: 9999999999,
        inactive: false,
    }
    
    if (error) {
        alert('Authentication failed')
    } else if (!refresh_token) {
        window.location.replace('/')
    } else {
        if (access_token || refresh_token) {
            getNowPlaying()
            state.interval = setInterval(getNowPlaying, config.interval);
            
            if(no_instructions) {
                $('#instructions').hide()
            }
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
    
    function updateUI(response, jqXHR) {
        if(config.debug) { console.log(response, jqXHR) }
        if (jqXHR.status == 200 && response) {
            activateUI()

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
            let distance = Math.abs(progress - state.previousProgress)
            if(distance > 3500) { $('#progress-bar').width(actualWidth) } 
    
            $('#progress-bar').animate({width: widthTarget}, (config.interval - 100))
           
            state.previousProgress = progress
        } else if (jqXHR.status == 200 && !response) { // No available devices found
            inactivateUI('no available devices were found')
        } else if (jqXHR.status == 204) { // No song playing or user in private session
            inactivateUI('of inactivity')
        } 
        
    }

    // Not currently used
    function resetUI(title) {
        $('#album-icon').removeClass('rotating')
        $('#title').text( title ? title : 'Loading')
        $('#track-name').text('')
        $('#artist-name').text('')
        $('#progress-bar').width(0)
        if($('#album-art').attr('src') != 'images/confuseddoggo.gif') {
            $('#album-art').attr('src', 'images/confuseddoggo.gif')
        }
    }

    function inactivateUI(reason) {
        if(!state.inactive) {
            if(config.debug) { console.log('inactivating UI') }
            
            $('#title').text(`Hiding player because ${reason}`)
            
            $('#title-area').removeClass('fadeIn')
            $('#player').removeClass('fadeIn')
            
            $('#title-area').addClass('middleFadeOut')
            $('#player').addClass('fadeOut')

            state.inactive = true
        }
    }

    function activateUI() {
        if(state.inactive) {
            if(config.debug) { console.log('activating UI') }

            $('#title-area').removeClass('middleFadeOut')
            $('#player').removeClass('fadeOut')

            $('#title-area').addClass('fadeIn')
            $('#player').addClass('fadeIn')

            state.inactive = false
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