const fs = require('fs')
const fetch = require('node-fetch');;
const yaml = require('js-yaml')
const Discord = require('discord.js')
module.exports.run = async (bot, message, args, settings) => {
  //Makes sure it can only be done in my server (@I am Ben#6686)
  if (message.guild.id != '489449496527503390') {
    message.channel.send("Sorry, this can only be done on my offical server.")
    return
  }
  //Get UUID of profile
  if (!args[0]) {
    message.delete()
    message.channel.send("Please provide me with a username").then(m => m.delete({ timeout: 4500 }))
    return;
  }
  //Make sure username/UUID exists
  const url = `https://api.mojang.com/users/profiles/minecraft/${args[0]}`
  const res = await fetch(url).then(url => url.json())//.catch(function(e) {
  if (!res) {
    console.log("no")
    return
  }
  //Build file suitable UUID
  const UUID = res.id.slice(0,8) + "-" + res.id.slice(8,12) + "-" + res.id.slice(12,16) + "-" + res.id.slice(16,20) + "-" + res.id.slice(20,32)
  //Get stats on player
  fs.readFile(`E:/01_Personal/01_Servers/[1.16] Minecraft Server/[2] Survival/world/stats/${UUID}.json`, async (err, data) => {
    if (err) {
      message.delete()
      message.channel.send(`That user has not joined the server, yet.`).then(m => m.delete({ timeout: 3500 }))
      bot.logger.log(`User looked up \`${args[0]}\` but they've never joined the server.`, 'error')
      return
    }
    //Get player stats
    var facts = JSON.parse(data);
    //console.log(facts)
    //Get balance from player
    try {
      let fileContents = fs.readFileSync(`E:/01_Personal/01_Servers/[1.16] Minecraft Server/[2] Survival/plugins/Essentials/userdata/${UUID}.yml`, 'utf8');
      //get more info on player
      const data = yaml.safeLoad(fileContents);
      //Display Information + player head
      if (!args[1]) {
        var embed = new Discord.MessageEmbed()
        .setTitle(`User: ${args[0]}`)
        .setThumbnail(`https://crafatar.com/avatars/${UUID}.png`)
        .addField('Deaths:', (facts.stats["minecraft:custom"]["minecraft:deaths"] == undefined) ? "0" : facts.stats["minecraft:custom"]["minecraft:deaths"])
        .addField('Kills:', (facts.stats["minecraft:custom"]["minecraft:player_kills"] == undefined) ? "0" : facts.stats["minecraft:custom"]["minecraft:player_kills"])
        .addField('Balance:', `$${data["money"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`)
        .addField('Wither:', (facts.stats["minecraft:killed"]["minecraft:wither"] == undefined ? "0" : facts.stats["minecraft:killed"]["minecraft:wither"]), true)
        .addField('Ender Dragon:', (facts.stats["minecraft:killed"]["minecraft:ender_dragon"] == undefined ? "0" : facts.stats["minecraft:killed"]["minecraft:ender_dragon"]), true)
        .addField('Elder Guardian:', (facts.stats["minecraft:killed"]["minecraft:elder_guardian"] == undefined ? "0" : facts.stats["minecraft:killed"]["minecraft:elder_guardian"]), true)
        .addField('Mined netherite:', (facts.stats["minecraft:mined"]["minecraft:ancient_debris"] == undefined ? "0" : facts.stats["minecraft:mined"]["minecraft:ancient_debris"]), true)
        .addField('Mined Diamonds', (facts.stats["minecraft:mined"]["minecraft:diamond_ore"] == undefined ? "0" : facts.stats["minecraft:mined"]["minecraft:diamond_ore"]), true)
        message.channel.send(embed)
      } else if (args[1] == 'mined' || args[1] == 'dropped' || args[1] == 'killed' || args[1] == 'broken' || args[1] == 'crafted' || args[1] == 'killed_by' || args[1] == 'picked_up' || args[1] == 'used' || args[1] == "custom") {
        console.log(facts.stats[`minecraft:${args[1]}`])
        //strip stuff from it
        const entry = JSON.stringify(facts.stats[`minecraft:${args[1]}`]).substr(12).replace(/"minecraft:/g, "").replace(/":/g, " ").replace(/,/g,"\n")
        message.channel.send(entry.substring(0,1999))
      } else if (args[1] == 'balance' || args[1] == 'bal') {
        message.channel.send({embed:{description:`${args[0]} balance is: $${data["money"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}})
      } else {
        message.channel.send("Unable to help with that")
      }
    } catch (e) {
      console.log(e)
    }
  });
}
module.exports.config = {
	command: "profile",
	aliases: ["minecraft","profile"]
}
module.exports.help = {
	name: "minecraft",
	category: "Fun",
	description: "Shows minecraft profile stats on my server",
	usage: '!profile {username} [stat - optional]',
}
