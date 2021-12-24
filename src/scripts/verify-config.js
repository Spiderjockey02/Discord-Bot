// Dependencies

export const vaildate = (config) => {
	const vaildOnwer =  config.owners.every(c => typeof parseInt(c) === "number" && parseInt(c).toString().length  < 16)
	if(!config.owners || vaildOnwer) throw new Error(config.owners.length ? "Invalid ownerID is provided." : "Please provide an owner ID")
	if(parseInt(process.versions.node) < 16) throw new Error("Node.js verison 16 or higher is required.")
	if(!config.token || typeof config.token !== "string") throw new Error("An invalid token was provided.")
	if(!config.mongodb || typeof config.mongodb !== "string") throw new Error("An invalid mongo uri was provided.")
	const { twitch, fortnite, spotify, rainbow, genuis, amethyst, } = config.api
	if(!twitch.disable) throw new Error("Missing Twitch credentials.")
	if(!fortnite.disable) throw new Error("Missing Fortnite credentials.")
	if(!spotify.disable) throw new Error("Missing Spotify credentials.")
	if(!genuis.disable) throw new Error("Missing Genuis credentials.")
	if(!amethyst.disable) throw new Error("Missing Amethyst credentials.")
	if(!rainbow.disable) throw new Error("Missing RainbowSix credentials.")
	return true
}