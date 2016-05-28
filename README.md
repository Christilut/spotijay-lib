# spotijay-lib

Download tracks from Spotify in 320kbps.

# Installation

1. `npm install`
1. Install [libspotify](https://developer.spotify.com/technologies/libspotify/)
1. Install following libraries: lame sox eye3D
  - Ubuntu/Debian: `sudo apt-get install lame sox eyed3`
  - Arch: `yaourt -S libspotify python2-eyed3 lame sox`
  - OSX: `brew install homebrew/binary/libspotify lame sox eyeD3`
1. Copy your [appkey](https://developer.spotify.com/my-account/keys) in the root of the dir that uses this library (or specify another path, its the `__dirname` below that points to the appkey dir)

# Usage

```js
if (args.playlist) {
  Spotijay(args.username, args.password, __dirname, function(err, spotify) {
    spotify.downloadPlaylistByUrl(args.playlist, args.dir, errorCallback)
  })
} else if (args.track) {
  Spotijay(args.username, args.password, __dirname, function(err, spotify) {
    spotify.getTrackByUrl(args.track, args.dir, errorCallback)
  })
}
```

For more see [Spotijay](https://github.com/Christilut/Spotijay)
