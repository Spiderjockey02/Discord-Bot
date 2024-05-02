import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils';
import GuildManager from './Guild';
import UserManager from './User';
import RankManager from './Rank';
const LoggerClass = new Logger();

// Main prisma client
const client = new PrismaClient()
	.$extends({
		query: {
			async $allOperations({ operation, model, args, query }) {
				const start = Date.now(),
					result = await query(args),
					queryTime = Date.now() - start;

				LoggerClass.log(`Query: ${model}.${operation} - ${queryTime} ms`);
				return result;
			},
		},
	});

// Database handler
class DatabaseHandler {
	guildManager: GuildManager;
	userManager: UserManager;
	rankManager: RankManager;
	constructor() {
		this.guildManager = new GuildManager();
		this.userManager = new UserManager();
		this.rankManager = new RankManager();
	}
}


export { client, DatabaseHandler };
