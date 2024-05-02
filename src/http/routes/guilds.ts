import { Router } from 'express';
import EgglordClient from 'src/base/Egglord';
const router = Router();

// Guild page
export function run(client: EgglordClient) {

	// Get basic information on guild
	router.get('/:guildId', async (req, res) => {
		// Get the guild
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild) return res.status(400).json({ error: 'Guild not found!' });

		const { id, name, icon } = guild;
		const members = await guild.members.fetch();
		const users = members.filter(m => !m.user.bot).size;
		const bots = members.size - users;
		return res.json({ id, name, icon, totalMembers: members.size, users, bots });
	});

	// Get list of members in guild
	router.get('/:guildId/members', async (req, res) => {
		// Get the guild
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild) return res.status(400).json({ error: 'Guild not found!' });

		// Check if a specific userId was entered
		const userId = req.query.userId;
		if (typeof userId == 'string') {
			try {
				const guildMember = await guild.members.fetch(userId);
				return res.json({ members: [
					{ user: guildMember.user.displayName, id: guildMember.id, avatar: guildMember.displayAvatarURL({ size: 128 }) },
				] }) ;
			} catch (error) {
				client.logger.error(`Failed to lookup user with Id: ${userId}`);
				return res.json({ error: `No user with ID: ${userId} is in this guild.` });
			}
		}

		// Fetch all members
		await guild.members.fetch();
		const members = guild.members.cache.map(member => ({
			user: member.user.displayName,
			id: member.user.id,
			avatar: member.user.displayAvatarURL({ size: 128 }),
		}));

		res.json({ members });
	});

	// get list of channels (plus ability for TYPE & PERMS filtering)
	router.get('/:guildId/channels', async (req, res) => {
		// Get the guild
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild)	return res.status(400).json({ error: 'Guild not found!' });

		let channels = guild.channels.cache.map(channel => ({
			type: channel.type,
			id: channel.id,
			name: channel.name,
			parentID: channel.parentId,
		}));

		// Check for channel type query
		const channelType = req.query.type;
		if (typeof channelType == 'string')		{
			if (Number.parseInt(channelType) > 0 && Number.parseInt(channelType) < 15) {
				channels = channels.filter(c => c.type == Number.parseInt(channelType));
			} else {
				return res.json({ error: 'Channel type must be between 0 and 15.' });
			}
		}

		// check for permission query
		const permissions = req.query.perms;
		if (typeof permissions == 'string') {
			channels = channels.filter(channel => {
				const ch = guild.channels.cache.get(channel.id);
				return ch?.permissionsFor(client.user)?.has(BigInt(permissions)) ? true : false;
			});
		}

		res.json({ channels });
	});

	router.get('/:guildId/refresh', async (req, res) => {
		const guild = client.guilds.cache.get(req.params.guildId);
		if (!guild)	return res.status(400).json({ error: 'Guild not found!' });

		try {
			await guild.fetchSettings();
			res.json({ success: 'Successfully reloaded guild settings' });
		} catch (e) {
			res.json({ error: `An error occured refreshing guild: ${req.params.guildId} settings.` });
		}
	});

	return router;
}
