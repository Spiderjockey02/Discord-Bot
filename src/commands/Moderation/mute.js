// Dependencies
const { timeEventSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class Mute extends Command {
	constructor(bot) {
		super(bot, {
			name: 'mute',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: ['MUTE_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MUTE_MEMBERS', 'MANAGE_ROLES'],
			description: 'Mute a user.',
			usage: 'mute <user> [time]',
			cooldown: 2000,
			examples: ['mute username', 'mute username 5m'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user can mute users
		if (!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// check if bot can add 'mute' role to user
		if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
			bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_ROLES').then(m => m.delete({ timeout: 10000 }));
		}

		// add user to role (if no role, make role)
		const member = message.getMember();

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(member[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));
			}
		}


		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.channel.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

		// get mute role
		let muteRole = message.guild.roles.cache.get(settings.MutedRole);
		// If role not found then make role
		if (!muteRole) {
			try {
				muteRole = await message.guild.roles.create({
					data: {
						name: 'Muted',
						color: '#514f48',
						permissions: ['READ_MESSAGE_HISTORY'],
					},
				});
				// update server with no muted role
				await message.guild.updateGuild({ MutedRole: muteRole.id });
				settings.MutedRole = muteRole.id;
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		}


		// add role to user
		try {
			member[0].roles.add(muteRole).then(async () => {
				// Make sure that the user is in a voice channel
				if (member[0].voice.channelID) {
					try {
						await member[0].voice.setMute(true);
					} catch (err) {
						if (bot.config.debug) bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					}
				}

				// reply to user
				message.channel.success(settings.Language, 'MODERATION/SUCCESSFULL_MUTE', member[0].user).then(m => m.delete({ timeout: 3000 }));
				// see if it was a tempmute
				if (message.args[1]) {
					const time = bot.timeFormatter.getTotalTime(message.args[1], message, settings.Language);
					if (!time) return;

					// connect to database
					const newEvent = await new timeEventSchema({
						userID: member[0].user.id,
						guildID: message.guild.id,
						time: new Date(new Date().getTime() + time),
						channelID: message.channel.id,
						roleID: muteRole.id,
						type: 'mute',
					});
					await newEvent.save();

					// remove mute role from user
					setTimeout(async () => {
						bot.commands.get('unmute').run(bot, message, settings);

						// Delete item from database as bot didn't crash
						await timeEventSchema.findByIdAndRemove(newEvent._id, (err) => {
							if (err) console.log(err);
						});
					}, time);
				}
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
