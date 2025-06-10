const express= require("express")

const router= express.Router()


const dashboard= require("./v1/routes/dashboard.route")
const productivity= require("./v1/routes/productivity.route")
const process= require("./v1/routes/process.route")

router.use("/Dashboard",dashboard)
router.use("/Productivity",productivity)
router.use("/Process",process)

module.exports= router;