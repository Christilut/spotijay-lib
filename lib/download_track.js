var async = require('async')
var crypto = require('crypto')
var exec = require('child_process').exec
var fs = require('fs')
var punycode = require('punycode')

module.exports = function(session) {
  return function(track, path, callback) {
    var tracktitle = track.artist.name + ' - ' + track.title

    if (track.availability === 'UNAVAILABLE') {
      console.log('Track unavavailabe, skipping: ' + tracktitle)
      return callback(null)
    }

    var player = session.getPlayer()

    // var destiny = path + '/' + track.artist.name + '/' + track.album.name + '/' + track.name
    var destiny = path + '/' + tracktitle

    var hashedName = crypto.createHash('sha1').update(
      tracktitle
    ).digest('hex')

    //getting a hash cuz eyeD3 is a motherfucker with special chars.
    var destinyHash = path + '/' + hashedName

    // skip if already exists
    if (fs.existsSync(destiny + '.mp3')) {
      console.log('File already exists, skipping: ' + tracktitle + '.mp3')
      return callback(null)
    }

    console.log('Downloading: ' + tracktitle)

    if (!fs.existsSync(path)) fs.mkdirSync(path)
    var ws = fs.createWriteStream(destinyHash + '.raw')

    player.load(track)
    player.play()
    player.pipe(ws)

    player.once('track-end', function() {
      player.stop()
      ws.end()

      async.waterfall([

        function(callback) {
          console.log('Converting raw file to wav')
          exec('sox ' + [
            '-r', 44100,
            '-b', 16,
            '-L',
            '-c', 2,
            '-e', 'signed-integer',
            '-t', 'raw',
            '"' + destinyHash + '.raw"',
            '"' + destinyHash + '.wav"'
          ].join(' '), function(err) {
            callback(err)
          })
        },
        function(callback) {
          console.log('Converting wav file to mp3 at 320kbps')
          exec('lame ' + [
            '--preset', 'insane',
            '-b', 320,
            '-h',
            '"' + destinyHash + '.wav"',
            '"' + destinyHash + '.mp3"'
          ].join(' '), function(err) {
            callback(err)
          })
        },
        function(callback) {
          track.album.coverImage(function(err, buffer) {
            if (err) {
              return callback(null, false)
            }
            fs.writeFile(destinyHash + '.png', buffer, function(err) {
              callback(null, true)
            })
          })
        },
        function(cover, callback) {
          console.log('Adding id3 tags')

          var coverCmd = ['--add-image', '"' + destinyHash + '.png:FRONT_COVER"']

          var args = [
            '-t', '"' + punycode.toASCII(track.title) + '"',
            '-a', '"' + punycode.toASCII(track.artist.name) + '"',
            '-A', '"' + punycode.toASCII(track.album.name) + '"',
            '-Y', '"' + track.album.year + '"',
            '"' + destinyHash + '.mp3"'
          ]

          // Adds the command to add a ilustration to the file
          if (cover)
            args = coverCmd.concat(args)

          var cmd = 'eyeD3 ' + args.join(' ')

          exec(cmd, function(err) {
            callback(err, cover)
          })

        },
        function(cover, callback) {
          // if (config.copy)
          //   exec('cp ' + destinyHash + '.mp3 ' + config.copy + '/' + destinyHash + '.mp3', function(err) {
          //     console.log(err)
          //   })
          // if (config.itunes)
          //   exec('open -a "itunes" ' + destinyHash + '.mp3 ', function(err) {
          //     console.log(err)
          //   })

          // cleanup
          fs.unlinkSync(destinyHash + '.raw')
          fs.unlinkSync(destinyHash + '.wav')
          fs.unlinkSync(destinyHash + '.png') // use flag? some may want it as cover.png or something

          fs.renameSync(destinyHash + '.mp3', destiny + '.mp3')

          // if (cover) {
          //   fs.renameSync(destinyHash + '.png', path + '/' + track.artist.name + ' - ' + track.title + '.png')
          // }
          callback()
        }

      ], function(err) {
        console.log('Finished: ' + tracktitle)
        ws.end()
        player.removeAllListeners('error')
        delete player, ws
        callback(err)
      })

    })

    player.on('error', function(err) {
      ws.end()
      callback(err)
    })
  }
}
