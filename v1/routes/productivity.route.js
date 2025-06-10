const express= require("express")

const router= express.Router();

const productivity= require("../controller/productivity.controller")

const {validateUser}= require("../utils/auth.utils")

router.post("/productivity",validateUser,productivity.productivity)

module.exports= router