## This section is for users self-hosting the bot and wanting to know how to use the music plugin.
```
MusicPlugin: { type: Boolean, default: true },
MusicDJ: { type: Boolean, default: false },
MusicDJRole: { type: String, default: '00' },
```
> Note these are the default settings, so it's recommended to edit these values on your database on your own server's settings.

`MusicPlugin`: Whether or not the musisc plugin should be active or not. (`true` or `false`)

`MusicDJ`: Whether or not you want a DJ role so only users with that role can use the music plugin.

`MusicDJRole`: The Role ID of the DJ role. (`true` or `false`)
