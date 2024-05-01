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
  options: any
}

export interface EventConstructor {
  name: string
  dirname: string
  child?: 'giveawayManager' | 'audioManager'
}