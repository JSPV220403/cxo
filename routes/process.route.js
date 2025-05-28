const express= require("express")

const router= express.Router();

const process= require("../controller/process.controller")

router.post("/process",process.process);

module.exports= router
