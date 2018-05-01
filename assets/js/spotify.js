//opening the spotify player 
var device_id;
const token = spotifyAccessToken;

    window.onSpotifyWebPlaybackSDKReady = () => {
      
      const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); }
      });

      // Error handling
      player.on('initialization_error', e => { console.error(e); });
      player.on('authentication_error', e => { console.error(e); });
      player.on('account_error', e => { console.error(e); });
      player.on('playback_error', e => { console.error(e); })

      // Playback status updates
      player.on('player_state_changed', state => {
        console.log(state);
        $("#album-art").html(state.track_window.current_track.album.images["0"])
        $("#song-name").text(state.track_window.current_track.name);
        $("#playlist_name").text(state.context.metadata.context_description);
        $("#artist-name").text(state.track_window.current_track.artists["0"].name);

      });

      // Ready
      player.on('ready', data => {
        device_id = data.device_id;
        console.log('Ready with Device ID', device_id);

        spotifyLoaded = true;

        // var settings = {
        //   "async": true,
        //   "crossDomain": true,
        //   "url": "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        //   "method": "PUT",
        //   "headers": {
        //     "Content-Type": "application/json",
        //     "Authorization": "Bearer BQBtlTysw683XAmXblJGUzyyYE-NSbwSdpwb_78yBdQJNuQ6esPxyX2fUieI-CSQHmNSiBCFDQ4hMl0cjEU8tlH6fb2UiIHc7tXY8vbR83sJgSXAbNCvKLgjExvwGMfNs6w2maauikg3YNeWedqEl69MHOod9YtDk3cWjxlD",
        //   },
        //   "processData": false,
        //   "data": "{\n\t\"context_uri\": \"spotify:album:5ht7ItJgpBH7W6vJ5BqpPr\"\n}"
        // }

        // $.ajax(settings).done(function (response) {
        //   console.log(response);
        // });
// pulling the ajax info for the spotify player 

                


              $("#pause").click(function() {
                var pause = {
                   url: "https://api.spotify.com/v1/me/player/pause?device_id=" + device_id,
                   method: "PUT",
                   headers: {"Authorization": "Bearer "+token},
                   
                 };
                $.ajax(pause).then(function (a,b,c,d) {
                  console.log(a,b,c,d);
                });
              })
         
                  
        
              $("#play").click(function() {
                var play = {
                   url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
                   method: "PUT",
                   headers: {"Authorization": "Bearer "+token},
                 };
                 $.ajax(play).then(function (a,b,c,d) {
                  console.log(a,b,c,d);
                });
              })    
               
          
              $("#next").click(function() {
                var next = {
                  url: "https://api.spotify.com/v1/me/player/next?device_id=" + device_id,
                  method: "POST",
                  headers: {"Authorization": "Bearer "+token},
                };
                $.ajax(next).then(function (a,b,c,d) {
                  console.log(a,b,c,d);
                });
              })

               $("#previous").click(function() {
                var previous = {
                  url: "https://api.spotify.com/v1/me/player/previous?device_id=" + device_id,
                  method: "POST",
                  headers: {"Authorization": "Bearer "+token},
                };
                $.ajax(previous).then(function (a,b,c,d) {
                  console.log(a,b,c,d);
                });
              })
               

    });


        
      // You can now initialize Spotify.Player and use the SDK
      player.connect().then(success => {
        if (success) {
          console.log("The Web Playback SDK successfully connected to Spotify!")
        }
      })
    };


checkToPlay();


function checkToPlay() {
  if (spotifyLoaded && weatherLoaded) {
    // play music
    var info = {
      url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
      method: "PUT",
      headers: {"Authorization": "Bearer "+token},
      data: JSON.stringify({"context_uri": "spotify:user:1223107505:playlist:" + currentPlaylistID })
    };

        $.ajax(info).done(function (a,b,c,d) {
          console.log(a,b,c,d);
        }).fail(function(a,b,c,d) {
          console.log(a,b,c,d);
        });
  } else {
    setTimeout(checkToPlay, 500);
  }
}
