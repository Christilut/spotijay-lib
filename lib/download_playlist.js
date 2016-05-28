var async = require('async')
var sp = require('libspotify')

module.exports = function(session) {
  var downloadTrack = require(__dirname + '/download_track')(session)

  function downloadPlaylist(url, path, callback) {
    var args = arguments
    var playlist = sp.Playlist.getFromUrl(url)

    console.log('Getting playlist contents from Spotify...')

    playlist.whenReady(function() {
      playlist.getTracks(function(tracks) {
        var left = tracks.length

        if (left) {
          async.mapSeries(tracks, function(track, callback) {
            console.log('Tracks left: ' + left)
            left--
            downloadTrack(track, path, callback)

          }, function(err) {
            if (err) {
              callback(err)
            } else {
              console.log('Downloaded all tracks')
              setTimeout(function() {
                downloadPlaylist.apply(downloadPlaylist, args)
              }, 60 * 1000)
            }
          })

        } else {
          console.log('There are no tracks on this playlist')
          setTimeout(function() {
            downloadPlaylist.apply(downloadPlaylist, args)
          }, 60 * 1000)
        }
      })
    })
  }

  return downloadPlaylist
}
