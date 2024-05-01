// Dependencies
const { AttachmentBuilder, ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ Embed } = require('../../utils'), ;
import Command from '../../structures/Command';

// image types
const image_1 = ['3000years', 'affect', 'approved', 'beautiful', 'blur', 'circle', 'deepfry', 'facepalm', 'greyscale', 'invert', 'joke-over-head', ' rip', 'trigger', 'wanted', 'wasted'];
const image_2 = ['bed', 'distracted', 'kiss', 'slap', 'spank', 'whowouldwin'];

/*
const image_1 = ['3000years', 'approved', 'beautiful', 'brazzers', 'burn', 'challenger', 'circle', 'contrast', 'crush', 'ddungeon', 'dictator', 'distort', 'emboss', 'fire', 'frame', 'gay',
	'glitch', 'greyscale', 'instagram', 'invert', 'jail', 'magik', 'missionpassed', 'moustache', 'ps4', 'posterize', 'rejected', 'redple', 'rip', 'scary', 'sepia', 'sharpen', 'sniper', 'thanos',
	'tobecontinued', 'triggered', 'subzero', 'unsharpen', 'utatoo', 'wanted', 'wasted'];
const image_2 = ['afusion', 'batslap', 'vs'];
*/
/**
 * Generate command
 * @extends {Command}
*/
export default class Generate extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'generate',
			dirname: __dirname,
			aliases: ['gen'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Generate a custom image.',
			usage: 'generate <option> [image]',
			cooldown: 5000,
			examples: ['generate 3000years username', 'generate beautiful <attachment>', 'generate list'],
			slash: true,
			options: [{
				name: 'option',
				description: 'Option',
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [{ name: 'list', value: 'list' }, ...image_1.map(item => ({ name: item, value: item })), ...image_2.map(item => ({ name: item, value: item }))].slice(0, 24),
			}, {
				name: 'user',
				description: 'User\'s avatar to manipulate.',
				type: ApplicationCommandOptionType.User,
				required: false,
			}, {
				name: 'user2',
				description: 'Second user\'s avatar to manipulate.',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(client, message) {
		// If user wants to see generate list
		if (!message.args[0] || ['list', '?'].includes(message.args[0]) || (!image_1.includes(message.args[0]) && !image_2.includes(message.args[0]))) {
			const embed = new Embed(client, message.guild)
				.setDescription(message.translate('image/generate:DESC', { IMG_1: `${image_1.join('`, `')}`, IMG_2: `${image_2.join('`, `')}` }));
			return message.channel.send({ embeds: [embed] });
		}

		// Get image, defaults to author's avatar
		const choice = message.args[0];
		message.args.shift();
		const files = await message.getImage();
		if (!Array.isArray(files)) return;

		// Check if 2 images are needed
		if (image_2.includes(choice) && !files[1]) return message.channel.error('image/generate:NEED_2IMG');

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '' }));

		// send embed
		try {
			const image = await client.fetch(`image/${choice}`, { image1: files[0], image2: files[1] });
			const attachment = new AttachmentBuilder(image.data, { name: `${choice}.${choice == 'triggered' ? 'gif' : 'png'}` });
			msg.delete();
			message.channel.send({ files: [attachment] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const option = args.get('option').value;
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id).user.displayAvatarURL({ format: 'png', size: 1024 });
		const member2 = guild.members.cache.get(args.get('user2')?.value ?? interaction.user.id).user.displayAvatarURL({ format: 'png', size: 1024 });
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: client.customEmojis['loading'] }) });

		try {
			if (option == 'list') {
				const embed = new Embed(client, guild)
					.setDescription(guild.translate('image/generate:DESC', { IMG_1: `${image_1.join('`, `')}`, IMG_2: `${image_2.join('`, `')}` }));
				return interaction.editReply({ content: ' ', embeds: [embed] });
			}

			// generate image
			const image = await client.fetch(`image/${option}`, { image1: member, image2: member2 });
			const attachment = new AttachmentBuilder(Buffer.from(image, 'base64'), { name: `${option}.${option == 'triggered' ? 'gif' : 'png'}` });

			interaction.editReply({ content: ' ', files: [attachment] });
		} catch(err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ content: ' ', embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
}

