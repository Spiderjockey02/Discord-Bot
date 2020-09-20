module.exports.run = async (bot, message, args, settings, ops) => {
	if (settings.MusicPlugin == false) return
	//This is done my mods+.
}
module.exports.config = {
	command: "foreceskip",
	aliases: ["fskip", "force-skip"]
}
module.exports.help = {
	name: "force skip",
	category: "Music",
	description: "Force skips a song",
	usage: '!forceskip',
}
