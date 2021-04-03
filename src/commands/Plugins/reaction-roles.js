const Command = require("../../structures/Command.js");
const ReactionsModel = require("../../modules/database/models/reactionrole");
const { MessageEmbed } = require("discord.js");
module.exports = class ReactionRoles extends Command {
  constructor(bot) {
    super(bot, {
      name: "reactionroles",
      dirname: __dirname,
      aliases: ["reaction-roles"],
      userPermissions: ["MANAGE_GUILD"],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Make reaction roles",
      usage: "reactionroles <channel>",
      cooldown: 5000,
      examples: ["reactionroles 37844848481818441"],
    });
  }

  // Run command
  async run(bot, message, args, settings) {
    let emojis;
    let roles;
    const [channelId] = args;
    const { guild } = message;
    const filter = (m) => message.author.id === m.author.id;

    if (!channelId) {
      return message
        .error(
          settings.Language,
          "INCORRECT_FORMAT",
          settings.prefix.concat(this.help.usage)
        )
        .then((m) => m.delete({ timeout: 5000 }));
    }
    message.channel.send(
      message.translate(settings.language, "PLUGINS/SEND_ROLES")
    );

    const roleMsgs = await message.channel.awaitMessages(filter, {
      time: 600000,
      max: 1,
      errors: ["time"],
    });
    const roleMsg = roleMsgs.first();
    roles = parseRoles(roleMsg, guild);

    message.channel.send(
      message.translate(settings.language, "PLUGINS/SEND_EMOJIS")
    );

    const emojiMsgs = await message.channel.awaitMessages(filter, {
      time: 600000,
      max: 1,
      errors: ["time"],
    });
    const emojiMsg = emojiMsgs.first();
    emojis = parseEmojis(emojiMsg);

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return message.channel.send(
        message.error(
          settings.Language,
          "MISSING_ROLES",
          settings.prefix.concat(this.help.usage)
        )
      );
    }

    const embed = new MessageEmbed()
      .setTitle(
        message.translate(settings.language, "PLUGINS/EGGLORD_REACTIONS")
      )
      .setDescription(
        message.translate(
          settings.language,
          "PLUGINS/REACT_BELOW",
          createDescription(roles, emojis)
        )
      );

    const msg = await channel.send(embed);

    emojis.forEach((em) => {
      msg.react(em);
    });

    const reactions = [];

    for (let i = 0; i < roles.length; i++) {
      reactions.push({ role_id: roles[i].id, emoji: emojis[i].toString() });
    }

    const newRR = new ReactionsModel({
      guild_id: guild.id,
      message_id: msg.id,
      reactions: reactions,
      channel_id: channelId,
    });

    newRR.save();

    return message.channel.send("Succes!");
  }
};
function createDescription(roles, emojis) {
  const strings = [];

  for (let i = 0; i < roles.length; i++) {
    strings.push(`${emojis[i]}: ${roles[i]}`);
  }

  return strings.join("\n");
}

function parseRoles(msg, guild) {
  const content = msg.content.trim().split(/ +/g);

  // Remove any duplicates
  const filtered = [...new Set(content)];

  let roles = [];

  filtered.forEach(async (roleId) => {
    const role =
      guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId));

    roles = [...roles, role];
    return role;
  });

  return roles;
}

function parseEmojis(msg) {
  let content = msg.content.trim().split(/ +/g);

  content = content.filter((s) => {
    // Remove custom emojis
    if (s.split(":").length === 1 ? false : true) {
      return false;
    }
    return true;
  });

  return [...new Set(content)];
}
