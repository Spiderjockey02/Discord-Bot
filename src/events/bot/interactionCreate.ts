import { BaseInteraction, CommandInteraction, ComponentType, Events, InteractionType, MessageComponentInteraction } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Interaction create event
 * @event Egglord#InteractionCreate
 * @extends {Event}
*/
export default class InteractionCreate extends Event {
	constructor() {
		super({
			name: Events.InteractionCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Interaction} interaction The interaction recieved (slash, button, context menu & select menu etc)
	 * @readonly
	*/
	async run(client: EgglordClient, interaction: BaseInteraction) {

		switch (interaction.type) {
			case InteractionType.ApplicationCommandAutocomplete:
				client.emit('autoComplete', interaction);
				break;
			case InteractionType.ApplicationCommand: {
				if ([ApplicationCommandType.User, ApplicationCommandType.Message].includes((interaction as CommandInteraction).commandType)) {
					client.emit('clickMenu', interaction);
				} else {
					client.emit('slashCreate', interaction);
				}
				break;
			}
			case InteractionType.ModalSubmit:
				client.emit('modalSubmit', interaction);
				break;
			case InteractionType.MessageComponent: {
				switch ((interaction as MessageComponentInteraction).componentType) {
					case ComponentType.RoleSelect:
						client.emit('RoleSelectMenu', interaction);
						break;
					case ComponentType.StringSelect:
						client.emit('SelectMenuSubmit', interaction);
						break;
					case ComponentType.Button:
						client.emit('clickButton', interaction);
						break;
				}
			}
		}
	}
}