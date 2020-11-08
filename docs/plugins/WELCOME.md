## This section is for users self-hosting the bot and wanting to know how to use the welcome plugin.

```
welcomePlugin: { type: Boolean, default: false },
welcomeRaidConnect: { type: Boolean, default: false },
welcomeMessageToggle: { type: Boolean, default: false },
welcomeMessageChannel: { type: String, default: '00' },
welcomeMessageText: { type: String, default: 'Hello {user}, Welcome to **{server}**!' },
welcomePrivateToggle: { type: Boolean, default: false },
welcomePrivateText: { type: String, default: 'Have a great time here in **{server}**.' },
welcomeRoleToggle: { type: Boolean, default: false },
welcomeRoleGive: { type: Array, default: ['562297641879470082'] },
welcomeGoodbyeToggle: { type: Boolean, default: false },
welcomeGoodbyeText: { type: String, default: '**{user}** just left the server.' },
```

> Note these are the default settings, so it's recommended to edit these values on your database on your own server's settings.

`welcomePlugin`: Whether or not the welcome plugin should be active or not. (`true` or `false`)

`welcomeRaidConnect`: Keep this false for now.

`welcomeMessageToggle`: Whether or not the bot should send a welcome message on the server. (`true` or `false`)

`welcomeMessageChannel`: The ID of the Text channel you want the welcome message to be sent to.

`welcomeMessageText`: The welcome message that will be sent to the welcome channel. (Available variables; `{user}`, `{server}`)

`welcomePrivateToggle`: Whether or not the bot should DM the user a welcome mesage. (`true` or `false`)

`welcomePrivateText`: The welcome message that will be sent to the user's DM. (Available variables; `{user}`, `{server}`)

`welcomeRoleToggle`: Whether or not the bot should give roles for the new user. (`true` or `false`)

`welcomeRoleGive`: An array of role ID's to give to the user.

`welcomeGoodbyeToggle`: Whether or not the bot should send a leave message on the server. (`true` or `false`)

`welcomeGoodbyeText`: The leave message that will be sent to the welcome channel. (Available variables; `{user}`, `{server}`)
