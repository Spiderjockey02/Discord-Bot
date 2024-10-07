import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

export default class Github extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'github',
			dirname: __dirname,
			description: 'Get information on a Github account or repository.',
			usage: 'github <username> [repository]',
			cooldown: 3000,
			examples: ['github SpiderJockey02 Discord-Bot'],
			slash: true,
			options: [{
				name: 'username',
				description: 'The username of Github user',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'repository',
				description: 'The name of the repository, the user owns.',
				type: ApplicationCommandOptionType.String,
			}],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		const username = message.args[0];
		const repo = message.args[1];

		const embed = await this.createEmbed(client, message.guild, username, repo);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const username = interaction.options.getString('username', true),
			repo = interaction.options.getString('repository') ?? '';

		const embed = await this.createEmbed(client, interaction.guild, username, repo);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for fetching/creating fornite embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} username The username to search
	 * @param {string} repo The platform to search the user on
 	 * @returns {embed}
	*/
	async createEmbed(client: EgglordClient, guild: Guild | null, username: string, repo: string) {
		try {
			const github = await fetchFromAPI('socials/github', { username, repo });
			if (github.error) throw new Error(github.error);

			const embed = new EgglordEmbed(client, guild);
			// Check if the response if about a user or repository
			if (github.avatarUrl) {
				embed
					.setTitle(`${username} (${github.fullName})`)
					.setURL(`https://github.com/${username}`)
					.setThumbnail(github.avatarUrl)
					.setDescription(github.bio)
					.addFields(
						{ name: 'Followers:', value: github.followers, inline: true },
						{ name: 'Following:', value: github.following, inline: true },
						{ name: 'Repositories:', value: github.repos },
					)
					.setFooter({ text:  `Created on: ${new Date(github.createdAt).toDateString()}` });
				if (github.location) embed.addFields({ name: 'Location', value: github.location, inline: true });
				if (github.company) embed.addFields({ name: 'Company:', value: `[${github.company}](https://github.com/${github.company.replace('@', '')})`, inline: true });
			} else {
				const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

				embed.setTitle(`Repository: ${repo}`)
					.setURL(`https://github.com/${username}/${repo}`)
					.setDescription(`**Description:**\n ${github.description}\n\n **Topics:**\n ${formatter.format(github.topics)}`)
					.addFields(
						{ name: 'Stars:', value: github.stars, inline: true },
						{ name: 'Forks:', value: github.forks, inline: true },
						{ name: 'Open issues:', value: github.openIssues, inline: true },
						{ name: 'Main language:', value: github.language, inline: true },
						{ name: 'Owner', value: `[${github.owner.username}](https://github.com/${github.owner.username})`, inline: true },
						{ name: 'License', value: github.license, inline: true },
					)
					.setFooter({ text:  `Created on: ${new Date(github.createdAt).toDateString()}` });
			}

			return embed;
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}