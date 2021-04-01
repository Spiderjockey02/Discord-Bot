const { Schema, model } = require("mongoose");
module.exports = model(
  "ReactionRole",
  new Schema({
    guild_id: { type: String, required: true },
    message_id: { type: String, required: true },
    channel_id: { type: String, required: true },
    reactions: { type: Array, required: true },
  })
);