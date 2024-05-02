import Discord from 'discord.js';
import { User as UserDB, Guild as GuildDB, Prisma } from '@prisma/client';
import EgglordClient from 'src/base/Egglord';

const fullSettings = Prisma.validator<Prisma.SettingDefaultArgs>()({
	include: { ticketSystem: true, levelSystem: true,
		welcomeSystem: {
			include: {
				joinRolesGive: true,
			},
		},
		musicSystem: true, moderationSystem: {
			include: {
				loggingEvents: true,
			},
		},
	},
});


declare module 'discord.js' {
  // Extend DM Channel
  interface DMChannel {
    error: (key: string, args: string, returnValue: boolean) => void
    success: (key: string, args: string, returnValue: boolean) => void
    checkPerm:() => true
  }

  // Extend Guild
  interface BaseGuild extends GuildDB {
    translate: (key: string, args?: {[key: string]: string | number}) => string
    settings: Prisma.SettingGetPayload<typeof fullSettings> | null
    client: EgglordClient
    isCurrentlyPlayingMusic: () => boolean | string
    fetchSettings:() => Promise<Prisma.SettingGetPayload<typeof fullSettings>>
  }

  interface GuildMember {
    canPlayMusic: (player: Player) => boolean | string
  }

  interface User extends UserDB {}

  interface BaseGuildVoiceChannel {
    checkPerm: (perm: PermissionFlagsBits) => boolean
  }

  interface BaseGuildTextChannel {
    checkPerm: (perm: PermissionFlagsBits) => boolean
  }

  interface ThreadChannel {
    checkPerm: (perm: PermissionFlagsBits) => boolean
  }

  interface Message {
    args: string[]
    getArgs: () => string[]
    getMember: () => GuildMember[]
    getChannel: () => GuildChannel[]
    getRole: () => Role[]
    getImage: () => any
  }
}