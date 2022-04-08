// Importing modules 
const mongoose = require('mongoose'); 
var crypto = require('crypto'); 
const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	gamesplayed: {
		type:	Number,
		default: 0
	}
});

// Exporting module to allow it to be imported in other files 
const User = module.exports = mongoose.model('User', UserSchema); 