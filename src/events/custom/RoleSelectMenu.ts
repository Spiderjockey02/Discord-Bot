const Event = require('../../structures/Event');

/**
 * RoleSelectMenu event
 * @event Egglord#RoleSelectMenu
 * @extends {Event}
*/
class RoleSelectMenu extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}
	/**
   * Function for receiving event.
   * @param {bot} bot The instantiating client
   * @param {ModalSubmitInteraction} interaction The member that was warned
   * @readonly
  */
	async run(bot, interaction) {
		const id = interaction.customId.split('-')[1];

		interaction.reply({ content: 'done' });
	}
}

module.exports = RoleSelectMenu;
