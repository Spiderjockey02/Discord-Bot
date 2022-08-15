// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');
const Canvas = require("canvas");
const Discord = require("discord.js");
const { registerFont, createCanvas } = require('canvas')
registerFont('./compose-black.ttf', { family: 'Compose Black' })
/**
 * Guild member add event
 * @event Egglord#GuildMemberAdd
 * @extends {Event}
*/
class GuildMemberAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildMember} member The member that has joined a guild
	 * @readonly
	*/
	async run(bot, member) {
	// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${member.user.tag} has been joined guild: ${member.guild.id}.`);

		if (member.user.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents?.includes('GUILDMEMBERADD') && settings.ModLog) {
			const embed = new Embed(bot, member.guild)
				.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${member.id}` })
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor({ name: 'User joined:', iconURL: member.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${member.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

		// Welcome plugin (give roles and message)
		if (settings.welcomePlugin) {
			const channel = member.guild.channels.cache.get(settings.welcomeMessageChannel);
			if (channel) {
			const canvas = Canvas.createCanvas(1440, 488);
			const ctx = canvas.getContext('2d');
			this.avatar = member.user.displayAvatarURL({ format: 'png' })
            this.username = member.user.username +'#'+ member.user.discriminator
            this.circleColor = "#FC5430"
            this.mainText = "Welcome!"
            this.mainTextColor = "#fff"
            this.secondText = `We Are Now ${member.guild.memberCount} Members In The Server!`
            this.secondTextColor = "#FC5430"
            this.pseudoColor = "#fff"
            this.background = "./welcome.png"
			const background = await Canvas.loadImage(this.background);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
			ctx.font = '80px "Compose Black"';
			ctx.fillStyle = this.mainTextColor;
			ctx.textAlign = "center";
			ctx.shadowColor = "black";
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10
            ctx.shadowBlur = 15;
			ctx.fillText(this.mainText.toUpperCase(), 771, 345);
	
			ctx.font = '60px "Compose Black"';
			ctx.fillStyle = this.pseudoColor;
			ctx.textAlign = "center";
			ctx.fillText(this.username.toUpperCase(), 771, 400);
	
			ctx.font = '35px "Compose Black"';
			ctx.fillStyle = this.secondTextColor;
			ctx.textAlign = "center";
			ctx.fillText(this.secondText.toUpperCase(), 771, 450);
	
			ctx.beginPath();
			ctx.fillStyle = this.circleColor;
            ctx.shadowColor = "#fff"; 
			ctx.arc(771, 140, 126, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
	
			ctx.beginPath();
			ctx.arc(771, 140, 118, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
	        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
			ctx.drawImage((avatar), 652, 22, 237, 237);//start, margin,width, height
			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "welcome.jpg");
				try {
					channel.send({
						content: `${member.toString()} **Welcome to ${member.guild.name}!** `,
						files: [attachment]
					  })
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}} //#region channel.send(settings.welcomeMessageText.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message));
			// Send private message to user
			if (settings.welcomePrivateToggle) member.send(settings.welcomePrivateText.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message));

			// Add role to user
			try {
				if (settings.welcomeRoleToggle) await member.roles.add(settings.welcomeRoleGive);
			} catch (err) {
				console.log(settings.welcomeRoleGive);
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = GuildMemberAdd;
