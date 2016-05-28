var sp = require('libspotify')
var path = require('path')

module.exports = function(username, password, dir, cb) {
  var session = new sp.Session({
    applicationKey: path.join(dir, 'spotify_appkey.key')
  })

  var downloadTrack = require('./lib/download_track')
  var downloadPlaylist = require('./lib/download_playlist')
  var getTrackByUrl = require('./lib/get_track')

  session.login(username, password)

  session.once('login', function(err) {

    cb(null, {
      downloadTrack: downloadTrack(session),
      downloadPlaylistByUrl: downloadPlaylist(session),
      getTrackByUrl: getTrackByUrl(session)
    })
  })

  session.on('error', function(err) {
    cb(err)
    session.close()
    process.exit()
  })
}
