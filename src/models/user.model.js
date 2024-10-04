const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const userSchema = new Schema({
	fullName: {
		type: String,
		required: [true, "Name is required"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		trim: true,
		unique: true,
		index: true,
	},
	passwordHash: {
		type: String,
		required: true,
		trim: true,
		select: false,
	},
	type: {
		type: String,
		enum: ["admin", "Creator", "student"],
		required: true,
		trim: true,
	},
	coursesOwned: [
		{
			type: Schema.Types.ObjectId,
			ref: "Course",
		},
	],
});


// Methods

/**
 * Compares the given password to the user's hashed password.
 * @param {string} password The password to compare to the user's hashed password.
 * @returns {Promise<boolean>} true if the password is correct, false otherwise.
 */
userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.passwordHash);
};

/**
 * Generates a JWT token that is valid for 1 hour, containing the user's ID in the payload.
 * @returns {string} The generated JWT token.
 */
userSchema.methods.generateToken = function () {
	return jwt.sign(
		{ _id: this._id, email: this.email },
		process.env.JWT_SECRET,
		{ expiresIn: "1h" }
	);
};

// Middleware for hashing password before saving

/**
 * Middleware for hashing password before saving
 * @param {Function} next The next middleware or error handler.
 */
userSchema.pre("save", async function (next) {
	try {
		if (this.isModified("passwordHash")) {
			const salt = await bcrypt.genSalt(10);
			this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
		}
		next();
	} catch (error) {
		next(error);
	}
});

const User = mongoose.model("User", userSchema);
module.exports = User;
