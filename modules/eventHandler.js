//Load events
const fs = require('fs')
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
module.exports = async bot => {
  const evtFiles = await readdir(`./events/`);
  bot.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    bot.logger.log(`Loading Event: ${eventName}`);
    const event = require(`../events/${file}`);
    bot.on(eventName, event.bind(null, bot));
  });
}
