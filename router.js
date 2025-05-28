const express= require("express")

const router= express.Router()


const dashboard= require("./routes/dashboard.route")
const productivity= require("./routes/productivity.route")
const process= require("./routes/process.route")

router.use("/Dashboard",dashboard)
router.use("/Productivity",productivity)
router.use("/Process",process)

module.exports= router;