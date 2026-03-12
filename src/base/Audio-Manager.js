const { DiscordJSManager, SearchPlatform } = require('magmastream'),
    { LavalinkNodes: nodes } = require('../config');
require('../structures/Player');

/**
 * Audio manager
 * @extends {DiscordJSManager}
*/
class AudioManager extends DiscordJSManager {
    constructor(bot) {
        super(bot, {
            nodes,

            defaultSearchPlatform: SearchPlatform.YouTube,
            clientName: bot.user?.username ?? 'magmastream',
            defaultSearchPlatform: 'ytmsearch',
            playNextOnEnd: true,
        });
    }
}


module.exports = AudioManager;
