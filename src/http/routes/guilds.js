// Dependencies
const express = require('express'),
	{ Permissions } = require('discord.js'),
	router = express.Router();

// Guild page
module.exports = function(bot) {
	// Get basic information on guild
	router.get('/:guildId', async (req, res) => {

		// fetch guild's basic information
		const guild = bot.guilds.cache.get(req.params.guildId);
		if (guild) {
			const { id, name, icon, members: { size } } = guild;
			const userMembers = guild.members.cache.filter(m => !m.user.bot).size;
			const botMembers = size - userMembers;
			return res.status(200).json({ id, name, icon, totalMembers: size, userMembers, botMembers });
		}
		res.status(400).json({ error: 'Guild not found!' });
	});

	// Get list of members in guild
	router.get('/:guildId/members', async (req, res) => {

		// fetch member list of guild
		const guild = bot.guilds.cache.get(req.params.guildId);
		if (guild) {
			await guild.members.fetch();

			// check if an ID query was made
			let members = guild.members.cache.map(member => ({
				user: member.user.username,
				id: member.user.id,
				avatar: member.user.displayAvatarURL({ size: 128 }),
			}));

			// check for ID query
			if (req.query.ID) members = members.filter(mem => mem.id == req.query.ID);

			// check if any member are left
			if (!members[0]) {
				res.status(400).json({ error: 'No members found!' });
			} else {
				return res.status(200).json({ members });
			}
		}
		res.status(400).json({ error: 'Guild not found!' });
	});

	// get list of channels (plus ability for TYPE & PERMS filtering)
	router.get('/:guildId/channels', async (req, res) => {

		// fetch member list of guild
		const guild = bot.guilds.cache.get(req.params.guildId);
		if (guild) {
			let channels = guild.channels.cache.map(channel => ({
				type: channel.type,
				id: channel.id,
				name: channel.name,
				parentID: channel.parentID || null,
			}));

			// check for type query
			if (req.query.type) channels = channels.filter(c => c.type == req.query.type);

			// check for permission query
			if (req.query.perms) {
				const perms = new Permissions(BigInt(parseInt(req.query.perms)));
				channels = channels.filter(channel => {
					const ch = guild.channels.cache.get(channel.id);
					return ch.permissionsFor(bot.user).has(perms) ? true : false;
				});
			}


			// check if any member are left
			if (!channels[0]) {
				res.status(400).json({ error: 'No channels found!' });
			} else {
				return res.status(200).json({ channels });
			}
		}
		res.status(400).json({ error: 'Guild not found!' });
	});

	return router;
};
