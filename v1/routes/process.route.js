const express= require("express")

const router= express.Router();

const process= require("../controller/process.controller")

const {validateUser}= require("../utils/auth.utils")

router.post("/process",validateUser,process.process);

module.exports= router
