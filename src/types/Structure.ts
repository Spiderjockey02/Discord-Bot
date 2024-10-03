import { ApplicationCommandOptionData, ClientEvents } from 'discord.js';
import { ManagerEvents } from'magmastream';

export interface CommandHelpInterface {
  name: string
  category: string
  aliases: string[]
  description: string
  usage: string
  examples: string[]
}

export interface CommandConfInterface {
  guildOnly: boolean
  userPermissions: bigint[]
  botPermissions: bigint[]
  nsfw: boolean
  ownerOnly: boolean
  cooldown: number
  slash: boolean
  isSubCmd: boolean
  options: ApplicationCommandOptionData[]
}

export interface CommandConstruct {
  name: string
  guildOnly?: boolean
  dirname: string
  aliases?: string[]
  botPermissions?: bigint[]
  userPermissions?: bigint[]
  examples?: string[]
  nsfw?: boolean
  ownerOnly?: boolean
  cooldown?: number
  description?: string
  usage?: string
  slash?: boolean
  isSubCmd?: boolean
  options?: ApplicationCommandOptionData[]
}

export type giveawayEvents = 'endedGiveawayReactionAdded' | 'giveawayDeleted' | 'giveawayEnded' | 'giveawayReactionAdded' | 'giveawayReactionRemoved' | 'giveawayReolled'
export type ExtendedClientEvents = keyof ClientEvents | keyof ManagerEvents | giveawayEvents | 'ticketCreate' | 'ticketClose' | 'slashCreate' | 'autoComplete'

export interface IEventBase {
  name: ExtendedClientEvents
  category: string
}

export interface IEventAudio extends IEventBase {
  name: keyof ManagerEvents;
  child: 'audioManager';
}

export interface IEventGiveaway extends IEventBase {
  name: 'giveawayDeleted'
  child: 'giveawayManager'
}

export interface IEventGuild extends IEventBase {
  name: keyof ClientEvents
  child?: undefined;
}