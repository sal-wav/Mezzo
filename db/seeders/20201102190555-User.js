"use strict";
const bcrypt = require('bcryptjs');

module.exports = {
	up: async(queryInterface, Sequelize) => {
		const hash = await bcrypt.hash('Password123!', 10);
		const hashTwo = await bcrypt.hash('Password456!', 10);
		return queryInterface.bulkInsert("Users", [
			{
				firstName: "Demo",
				lastName: "User",
				email: "demo@user.com",
				password: hash,
				image: '/images/Untitled design.png',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				firstName: "Demotwo",
				lastName: "Usertwo",
				email: "demotwo@usertwo.com",
				password: hashTwo,
				image: '/images/bear.png',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Users", null, {});
	},
};
