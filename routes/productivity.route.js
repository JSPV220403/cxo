const express= require("express")

const router= express.Router();

const productivity= require("../controller/productivity.controller")

router.post("/productivity",productivity.productivity)

module.exports= router