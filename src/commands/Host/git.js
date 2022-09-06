// Dependencies
const { execSync } = require('child_process'),
	Command = require('../../structures/Command.js');

/**
 * Git command
 * @extends {Command}
*/
class Git extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'git',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Displays git information',
			usage: 'git',
			cooldown: 3000,
			examples: ['git'],
			slash: true,
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		const t = await execSync('git status').toString();
		message.channel.send({ content: `\`\`\`css\n${t}\n\`\`\`` });
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async callback(bot, interaction) {
		const t = await execSync('git status').toString();
		interaction.reply({ content: `\`\`\`css\n${t}\n\`\`\`` });
	}
}

module.exports = Git;
