require("dotenv").config();


const express= require("express")
const morgan = require("morgan");
const app= express();

const router= require("./router")
app.use(express.json());

app.use(express.json({ limit: "10000000mb" }));
app.use(express.urlencoded({ limit: "1000000mb", extended: true }));


app.use(morgan("dev"));
app.use("/v1/api",router)

app.listen(8080,()=>{
    console.log("Server started at port 8080")
})