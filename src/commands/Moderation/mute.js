// Dependencies
const { MutedMemberSchema, timeEventSchema } = require('../../database/models'),
	{ time: { getTotalTime } } = require('../../utils'),
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

		// add user to role (if no role, make role)
		const members = await message.getMember();

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:MUTE_MEMBERS') }).then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.delete({ timeout: 10000 }));

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
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			}
		}


		// add role to user
		try {
			members[0].roles.add(muteRole).then(async () => {
				// Make sure that the user is in a voice channel
				if (members[0].voice.channelID) {
					try {
						await members[0].voice.setMute(true);
					} catch (err) {
						if (bot.config.debug) bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					}
				}

				// update database (in case user leaves to try and remove the muted role)
				const newMute = await new MutedMemberSchema({
					userID: members[0].user.id,
					guildID: message.guild.id,
				});
				await newMute.save();

				// reply to user
				message.channel.success('moderation/mute:SUCCESS', { USER: members[0].user }).then(m => m.delete({ timeout: 3000 }));
				// see if it was a tempmute
				if (message.args[1]) {
					const time = getTotalTime(message.args[1], message);
					if (!time) return;

					// connect to database
					const newEvent = await new timeEventSchema({
						userID: members[0].user.id,
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
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
