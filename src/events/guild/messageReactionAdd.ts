import Event from 'src/structures/Event';
import { Events, MessageReaction, User } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Message reaction add event
 * @event Egglord#MessageReactionAdd
 * @extends {Event}
*/
export default class MessageReactionAdd extends Event {
	constructor() {
		super({
			name: Events.MessageReactionAdd,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {MessageReaction} reaction The reaction object
	 * @param {User} user The user that added the reaction
	 * @readonly
	*/
	async run(client: EgglordClient, reaction: MessageReaction, user: User) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Message reaction added${!reaction.message.guild ? '' : ` in guild: ${reaction.message.guild.id}`}`);

		// Make sure it's not a client and in a guild
		if (user.client) return;
		if (!reaction.message.guild) return;

		// If reaction needs to be fetched
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
		} catch (err: any) {
			return client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = reaction.message.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check for reaction
		const { guild } = reaction.message;
		// eslint-disable-next-line no-empty-function
		const member = await guild.members.fetch(user.id).catch(() => {});
		if (!member) return;

		// check database if reaction is from reaction role embed
		const dbReaction = await ReactionRoleSchema.findOne({
			guildID: guild.id,
			messageID: reaction.message.id,
		});

		if (dbReaction) {
			const rreaction = dbReaction.reactions.find(r => r.emoji === reaction.emoji.toString());
			if (rreaction) {
				// Add or remove role depending if they have it or not
				try {
					if (!member.roles.cache.has(rreaction.roleID)) {
						return await member.roles.add(rreaction.roleID);
					} else {
						return await member.roles.remove(rreaction.roleID);
					}
				} catch (err: any) {
					const channel = await client.channels.fetch(dbReaction.channelID).catch(() => client.logger.error(`Missing channel for reaction role in guild: ${guild.id}`));
					if (channel) channel.error(`I am missing permission to give ${member} the role: ${guild.roles.cache.get(rreaction.roleID)}`);
				}
			}
		}


		// make sure the message author isn't the client
		if (reaction.message.author.id == client.user.id) return;

		// Check if event messageReactionAdd is for logging
		if (settings.ModLogEvents?.includes('MESSAGEREACTIONADD') && settings.ModLog) {
			const embed = new Embed(client, reaction.message.guild)
				.setDescription(`**${user.toString()} reacted with ${reaction.emoji.toString()} to [this message](${reaction.message.url})** `)
				.setColor(3066993)
				.setFooter({ text: `User: ${user.id} | Message: ${reaction.message.id} ` })
				.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${reaction.message.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == reaction.message.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

