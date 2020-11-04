const express = require("express");
const { check } = require("express-validator");
const { User } = require("../db/models");
const { asyncHandler, csrfProtection, handleValidationErrors } = require("./utils");
const { loginUser, logoutUser } = require("../auth");
const router = express.Router();
const bcrypt = require("bcryptjs");

const isPassword = async (password, hash) =>
	await bcrypt.compare(password, hash);
const db = require('../db/models');


const userValidator = [
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for First Name')
    .isLength({ max: 50 })
    .withMessage('First Name must not be more than 50 characters long'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Last Name')
    .isLength({ max: 50 })
    .withMessage('Last Name must not be more than 50 characters long'),
  check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Email Address')
    .isLength({ max: 100 })
    .withMessage('Email Address must not be more than 255 characters long')
    .isEmail()
    .withMessage('Email Address is not a valid email')
    .custom((value) => {
      return db.User.findOne({
        where: { email: value }
      })
      .then((user) => {
        if (user) {
          return Promise.reject('The provided email is already in use by another account')
        }
      })
    }),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'g')
    .withMessage('Password must contain at least 1 lowercase letter, uppercase letter, number, and special character (i.e. "!@#$%^&*")'),
  check('confirmPassword')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Confirm Password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match')
      }
    }),
];

const loginValidator = [
  check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please provide your email')
    .custom((value) => {
      return db.User.findOne({
        where: { email: value }
      })
      .then((user) => {
        if (!user) {
          return Promise.reject('This email is not being used by an account')
      }
    }),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide your password')
  })
]


/* GET users listing. */
router.get("/", (req, res, next) => {
	res.send("respond with a resource");
});

router.get("/logged-in", (req, res, next) => {
  res.render('loggedInLayout')
})

//getting user by id
router.get(
	"/:id(\\d+)",
	asyncHandler(async (req, res, next) => {
		const user = await User.findByPk(req.params.id);
		res.render(req.user);
	})
);

router.get(
	"/login",
	csrfProtection,
	asyncHandler(async (req, res, next) => {
		res.render("login", { token: req.csrfToken() });
	})
);

router.post(
	"/login",
  csrfProtection,
  loginValidator,
  handleValidationErrors,
	asyncHandler(async (req, res, next) => {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email } });
		let hash = user.password;
		if (isPassword(password, hash)) {
			loginUser(req, res, user);
			 res.redirect('/');
		} else {
			res.render("error");
		}
	})
);

router.get(
	"/logout",
	asyncHandler(async (req, res, next) => {
		await logoutUser(req, res);
		res.redirect("/");
	})
);

router.post(
	"/logout",
	asyncHandler(async (req, res, next) => {
		await logoutUser(req, res);
		res.redirect("/");
	})
);

router.get(
	"/register",
  csrfProtection,
	asyncHandler(async (req, res, next) => {
		res.render("register", { token: req.csrfToken() });
	})
);

router.post(
	"/register",
  csrfProtection,
  userValidator,
  handleValidationErrors,
	asyncHandler(async (req, res, next) => {
		const { firstName, lastName, email, password } = req.body;
		let hash = await bcrypt.hash(password, 10);

		await User.create({
			firstName,
			lastName,
			email,
			password: hash,
		});

		res.redirect("/");
	})
);

module.exports = router;

//LOGIN & SIGNUP ROUTES GO HERE

//delete user route
