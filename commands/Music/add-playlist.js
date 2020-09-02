//Dependencies
module.exports.run = async (bot, message, args, settings, ops) => {
  console.log("playlist")
}
module.exports.config = {
	command: "add-playlist",
	aliases: ["playlist"]
}
module.exports.help = {
	name: "Playlist",
	category: "Music",
	description: "Adds a playlist to queue",
	usage: '!playlist',
}
