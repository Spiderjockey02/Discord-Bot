// Dependecies
const express = require('express'),
	router = express.Router();

// Guild page
module.exports = function(bot) {
	// Get basic information on guild
	router.get('/:guildId', async (req, res) => {
		if (bot.config.debug) bot.logger.debug(`IP: ${req.connection.remoteAddress.slice(7)} accessed \`/guilds/${req.params.guildId}\`.`);

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
		if (bot.config.debug) bot.logger.debug(`IP: ${req.connection.remoteAddress.slice(7)} accessed \`/guilds/${req.params.guildId}/members\`.`);

		// fetch member list of guild
		const guild = bot.guilds.cache.get(req.params.guildId);
		if (guild) {
			const members = guild.members.cache.map(member => ({
				tag: member.user.tag,
				avatar: member.user.displayAvatarURL({ size: 128 }),
			}));
			return res.status(200).json({ members });
		}
		res.status(400).json({ error: 'Guild not found!' });
	});

	return router;
};
