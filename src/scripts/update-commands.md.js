// Dependecies
const fs = require('fs');

module.exports = async (bot) => {
	const content = [
		'# Command list',
		'><> = required, [] = optional',
		''];

	// Get list of categories
	const categories = (bot.commands.map(c => '## ' + c.help.category).filter((v, i, a) => a.indexOf(v) === i));
	categories
		.sort((a, b) => a.category - b.category)
		.forEach(category => {
			const co = bot.commands
				.filter(c => c.help.category === category.slice(3))
				.sort((a, b) => a.help.name - b.help.name)
				.map(c => `| ${c.help.name}	|	${c.help.description}	|	\`${c.help.usage}\`	|`).join('\n');
			content.push(category, '|	Command	| description	| Usage', '|---------------|--------------------|--------------|', co, '\n');
		});
	// read to file
	fs.writeFileSync('./docs/COMMANDS.md', content.join('\n'));
};
