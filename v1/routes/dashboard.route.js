const express= require("express")

const router= express.Router();

const dashboardController= require("../controller/dasboard.controller")

const {validateUser}= require("../utils/auth.utils")

router.post("/dashboard",validateUser,dashboardController.dashboard)

module.exports= router