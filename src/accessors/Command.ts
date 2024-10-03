import { client } from './client';

export async function fetchAllCommands() {
	return client.command.findMany({});
}

export async function fetchByName(cmdName: string) {
	return client.command.findUnique({
		where: {
			name: cmdName,
		},
	});
}

export async function addToDatabase(cmdName: string) {
	return client.command.create({
		data: {
			name: cmdName,
		},
	});
}