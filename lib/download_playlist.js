var async = require('async')
var sp = require('libspotify')

module.exports = function(session) {
  var downloadTrack = require('./download_track')(session)

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
              console.log('Waiting 5 minutes before checking again...')
              setTimeout(function() {
                downloadPlaylist.apply(downloadPlaylist, args)
              }, 60 * 1000 * 5)
            }
          })

        } else {
          console.log('There are no tracks on this playlist')
          console.log('Waiting 5 minutes before checking again...')
          setTimeout(function() {
            downloadPlaylist.apply(downloadPlaylist, args)
          }, 60 * 1000 * 5)
        }
      })
    })
  }

  return downloadPlaylist
}
