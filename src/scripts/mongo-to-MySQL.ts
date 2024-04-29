const	{ GuildSchema, RankSchema,	WarningSchema,	GiveawaySchema,	PlaylistSchema,	ReactionRoleSchema,	timeEventSchema,	TagsSchema,	userSchema } = require('../database/models');


module.exports.run = async () => {
	// Update Guild settings
	const guilds = await GuildSchema.find();
	console.log(guilds);

	// Update ranks
	const ranks = await RankSchema.find();
	console.log(ranks);

	// Update warnings
	const warnings = await WarningSchema.find();
	console.log(warnings);

	// Update giveaways
	const giveaways = await GiveawaySchema.find();
	console.log(giveaways);

	// Update playlists
	const playlists = await PlaylistSchema.find();
	console.log(playlists);

	// Update reaction roles
	const reactionroles = await ReactionRoleSchema.find();
	console.log(reactionroles);

	// Update timeEvents
	const timeEvents = await timeEventSchema.find();
	console.log(timeEvents);

	// update tags
	const tags = await TagsSchema.find();
	console.log(tags);

	// update user schema
	const users = await userSchema.find();
	console.log(users);
};