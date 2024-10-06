import { Prisma } from '@prisma/client';

export const levelSettingType = Prisma.validator<Prisma.LevelSystemDefaultArgs>()({
	include: {
		ignoredChannels: true,
		ignoredRoles: true,
		roleRewards: true,
	},
});

export const ticketSettingType = Prisma.validator<Prisma.TicketSystemDefaultArgs>()({
	include: {
		supportRole: true,
		category: true,
	},
});

export type UserUpdateProps = {
	isSupport?: boolean
  isDev?: boolean
  isContributor?: boolean
  isBanned?: boolean
  isPremiumTo?: Date
}