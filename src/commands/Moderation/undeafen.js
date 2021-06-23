// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Undeafen extends Command {
	constructor(bot) {
		super(bot, {
			name: 'undeafen',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['undeaf', 'un-deafen'],
			userPermissions: ['DEAFEN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'DEAFEN_MEMBERS'],
			description: 'Undeafen a user.',
			usage: 'undeafen <user>',
			cooldown: 2000,
			examples: ['undeafen username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to undeafen.',
				type: 'USER',
				required: true,
			}],
			defaultPermission: false,
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Checks to make sure user is in the server
		const members = await message.getMember();

		// Make sure that the user is in a voice channel
		if (members[0]?.voice.channel) {
			// Make sure bot can deafen members
			if (!members[0].voice.channel.permissionsFor(bot.user).has('DEAFEN_MEMBERS')) {
				bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:DEAFEN_MEMBERS') }).then(m => m.timedDelete({ timeout: 10000 }));
			}

			// Make sure user isn't trying to punish themselves
			if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.timedDelete({ timeout: 10000 }));

			try {
				await members[0].voice.setDeaf(false);
				message.channel.success('moderation/undeafen:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
			} catch(err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			message.channel.error('moderation/undeafen:NOT_VC');
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const author = guild.members.cache.get(interaction.user.id),
			member = guild.members.cache.get(args.get('user').value),
			channel = guild.channels.cache.get(interaction.channelID);

		if(member?.voice.channel) {
			if(!member.voice.channel.permissionsFor(bot.user).has('DEAFEN_MEMBERS')) {
				bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${guild.id}].`);
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: bot.translate('permissions:DEAFEN_MEMBERs') }, true)] });
			}

			if (member.user.id == author.id) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:SELF_PUNISH', { ERROR: null }, true)] });

			try {
				await member.voice.setDeaf(false);
				return interaction.reply({ ephemeral: guild.settings.ModerationClearToggle, embeds: [channel.success('moderation/undeafen:SUCCESS', { USER: member.user }, true)] });

			} catch(err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
			}
		}
	}
};
