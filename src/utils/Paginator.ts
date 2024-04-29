const { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType } = require('discord.js');
// Timeout for button collector in milliseconds
const timeout = 30 * 1000;

module.exports = async (bot, interaction, pages, userID) => {
	let page = 0;

	// Function to create a button with specified properties
	const createButton = (customId, label, style, disabled = false) => new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style).setDisabled(disabled);

	// Create buttons for navigation
	const first = createButton('pagefirst', '⏮', ButtonStyle.Secondary, true);
	const prev = createButton('pageprev', '◀️', ButtonStyle.Secondary, true);
	const pageCount = createButton('pagecount', `${page + 1}/${pages.length}`, ButtonStyle.Secondary, true);
	const next = createButton('pagenext', '▶️', ButtonStyle.Secondary);
	const last = createButton('pagelast', '⏭', ButtonStyle.Secondary);

	// Create action row containing navigation buttons
	const buttons = new ActionRowBuilder().addComponents([first, prev, pageCount, next, last]);

	let msg;

	if (interaction instanceof CommandInteraction) {
		msg = await (interaction.deferred
			? interaction.followUp({ embeds: [pages[page]], components: [buttons], fetchReply: true })
			: interaction.reply({ embeds: [pages[page]], components: [buttons], fetchReply: true }));
	} else {
		msg = await interaction.send({ embeds: [pages[page]], components: [buttons] });
	}

	const buttonCollector = await msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: timeout });

	// Handle button interactions
	buttonCollector.on('collect', async (i) => {
		if (i.user.id !== userID) return;

		// Update page based on button custom ID
		switch (i.customId) {
			case 'pagefirst':
				page = 0;
				break;
			case 'pageprev':
				page = page > 0 ? --page : 0;
				break;
			case 'pagenext':
				page = page + 1 < pages.length ? ++page : pages.length - 1;
				break;
			case 'pagelast':
				page = pages.length - 1;
				break;
			default:
				break;
		}

		// Update page count label and button states
		pageCount.setLabel(`${page + 1}/${pages.length}`);
		first.setDisabled(page === 0);
		prev.setDisabled(page === 0);
		next.setDisabled(page === pages.length - 1);
		last.setDisabled(page === pages.length - 1);

		// Update message with new embed and buttons
		await i.update({ embeds: [pages[page]], components: [buttons], ephemeral: true }).catch((error) => {
			bot.logger.error('Error updating message:', error);
		});

		// Reset collector timer
		buttonCollector.resetTimer();
	});

	// Handle collector end event
	buttonCollector.on('end', async () => {
		// Edit interaction reply to remove buttons
		await interaction.editReply({ embeds: [pages[page]], components: [] }).catch((error) => {
			bot.logger.error('Error updating message:', error);
		});
	});

	// Return the message
	return msg;
};
