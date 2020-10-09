const { inspect } = require('util');

module.exports.run = async (args, message, bot) => {
	if (args[0] == 'send') {
		const channel = bot.channels.cache.find(c => c.id == args[1]);
		if (!channel) return bot.logger.error(`No channel with id: ${args[1]} was found.`);
		channel.send(message.slice(24));
		bot.logger.log(`Message successfully sent to Channel: ${args[1]}`);
	} else if (args[0] == 'addban') {
		// add a ban to global ban list
		console.log('addban');
	} else if (args[0] == 'eval') {
		// evaluate some code
		const toEval = args.pop();
		const evaluated = inspect(eval(toEval, { depth: 0 }));
		try {
			if (toEval) {
				const hrStart = process.hrtime();
				const hrDiff = process.hrtime(hrStart);
				return bot.logger.log(`Result: ${evaluated}. (Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms)`);
			} else {
				bot.logger.error(`Please use the format \`${bot.commands.get('eval').help.usage}\`.`);
			}
		} catch(e) {
			bot.logger.error(`Error whilst evaluating: \`${e.message}\``);
		}
	} else if (args[0] == 'reload') {
		// reload a command
		const commandName = args[1].toLowerCase();
		if (bot.commands.has(commandName)) {
			// Finds command
			const command = bot.commands.get(commandName);
			// reloads command
			try {
				delete require.cache[require.resolve(`../commands/${command.help.category}/${commandName}.js`)];
				bot.commands.delete(commandName);
				const pull = require(`../commands/${command.help.category}/${commandName}.js`);
				bot.commands.set(commandName, pull);
			} catch(e) {
				console.log(e);
				return bot.logger.error(`Could not reload: \`${args[1].toLowerCase()}\`.`);
			}
		} else {
			return bot.logger.error(`\`${args[1].toLowerCase()}\` isn't a command.`);
		}
		bot.logger.log(`Reloaded Command: ${commandName}.js`);
	} else if (args[0] == 'shutdown') {
		// Shutdown the bot
		// add a check if music is playing on a server
		try {
			await bot.logger.log('Bot was shutdown.');
			process.exit();
		} catch(e) {
			bot.logger.error(`ERROR: ${e.message}`);
		}
	} else {
		bot.logger.cmd('Available commands are: send, addban, eval, reload, shutdown');
	}
};
