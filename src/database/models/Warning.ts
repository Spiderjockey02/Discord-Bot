import { Schema, model } from 'mongoose';

const warningSchema = new Schema({
	userID: String,
	guildID: String,
	Reason: String,
	Moderater: String,
	IssueDate: String,
});

export default model('Warnings', warningSchema);
