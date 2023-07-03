const express = require("express");
const userController = require("../controllers/cvController");
const router = express.Router();

router.route("/").post(userController.login);

router.route("/register").post(userController.register);

router.route("/getUser").post(userController.getUserByToken);

router.route("/addCv").patch(userController.addCv);

router.route("/finalCv").post(userController.getCvsByToken);

router.route("/editCv").patch(userController.editCv);

router.route("/deleteCv").patch(userController.deleteCv);




module.exports = router