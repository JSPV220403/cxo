const express= require("express")

const router= express.Router();

const dashboardController= require("../controller/dasboard.controller")

router.post("/dashboard",dashboardController.dashboard)

module.exports= router