## This section is for users self-hosting the bot and wanting to know how to use the level plugin.
```
LevelPlugin: { type: Boolean, default: false },
LevelOption: { type: Number, default: 1 },
LevelChannel: { type: String, default: '00' },
LevelMessage: { type: String, default: 'GG {user}, you have leveled up to {level}!' },
LevelIgnoreRoles: { type: Array, default: ['No-xp'] },
LevelIgnoreChannel: { type: Array, default: ['No-xp'] },
LevelMultiplier: { type: Number, default: 1 },
LevelRoleRewards: { type: Array, default: ['gf'] },
```
> Note these are the default settings, so it's recommended to edit these values on your database on your own server's settings.

`LevelPlugin`: Whether or not the level plugin should be active or not. (`true` or `false`)

`LevelOption`: Set to 0 for now response, 1 to reply to the user for level up or 2 to send the level up message to a chosen channel.

`LevelChannel`: If `LevelOption` is set to 2, theN enter the ID of the channel you want to sent level up messages to.

`LevelMessage`: The level up message. (Available variables; {user}, {level})

`LevelIgnoreRoles`: An array of role ID's that will not gain XP.

`LevelIgnoreChannel`: An array of channel ID's that will allow XP to be gained in.

`LevelMultiplier`: Mulitplier of XP rate.

`LevelRoleRewards`: Coming soon
