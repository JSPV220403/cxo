const express= require("express")
const app= express();

const router= require("./router")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/",router)

app.listen(8080,()=>{
    console.log("Server started at port 8080")
})