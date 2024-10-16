import Discord from 'discord.js';
import { User as UserDB, Guild as GuildDB, Prisma } from '@prisma/client';
import LevelManager from 'src/helpers/LevelManager';
import TicketManager from 'src/helpers/TicketManager';

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

  export interface Client {
    logger: Logger;
    commandManager: CommandManager;
    config: typeof config;
    audioManager?: AudioManager;
    databaseHandler: DatabaseHandler;
    languageManager: LanguageManager;
    customEmojis: typeof customEmojis;
    webhookManger: WebhookManager;
    statistics: {
      messages: number
      commands: number
    };
  }

  // Extend Guild
  interface Guild extends GuildDB {
    settings: Prisma.SettingGetPayload<typeof fullSettings> | null
    isCurrentlyPlayingMusic: () => boolean | string
    fetchSettings:() => Promise<Prisma.SettingGetPayload<typeof fullSettings>>
  }

  interface Guild {
    levels: null | LevelManager
    tickets: null | TicketManager
  }

  interface GuildMember {
    canPlayMusic: (player: Player) => boolean | string
  }

  interface User extends UserDB {}

  interface GuildChannel {
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