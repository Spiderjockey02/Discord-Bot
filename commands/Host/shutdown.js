module.exports.run = async (bot, message) => {
	// Makes sure only the bot owner can run this command (People will only see this command if they're bot owner)
	if (message.member.id == bot.config.ownerID) {
		try {
			// SHutdown egglord
			await message.channel.send('Oh.. ok goodbye :disappointed_relieved:');
			await bot.logger.log(`Bot was shutdown by ${message.author.username}#${message.author.discriminator} in server: [${message.guild.id}]`);
			process.exit();
		}
		catch(e) {
			message.channel.send(`ERROR: ${e.message}`);
		}
	}
};
module.exports.config = {
	command: 'shutdown',
	aliases: ['shutdown'],
};
module.exports.help = {
	name: 'shutdown',
	category: 'Host',
	description: 'Shutdown Egglord',
	usage: '!shutdown',
};
