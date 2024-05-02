import EgglordClient from 'src/base/Egglord';
import { client } from './client';
import { ModerationLoggingEventEnum } from '@prisma/client';

export function addModerationLogs(discordClient: EgglordClient) {
	const events = discordClient.eventNames();

	// Add all moderation events to the database
	for (const event of events) {
		client.moderationLoggingEvents.create({
			data: {
				name: event as unknown as ModerationLoggingEventEnum,
			},
		});
	}
}