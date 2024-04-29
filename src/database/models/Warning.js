import { Schema, model } from 'mongoose';

const warningSchema = Schema({
	userID: String,
	guildID: String,
	Reason: String,
	Moderater: String,
	IssueDate: String,
});

export default model('Warnings', warningSchema);
