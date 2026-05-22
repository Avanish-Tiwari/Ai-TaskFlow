const express=require("express");
const cors=require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const authRoutes=require("./routes/auth")
const taskRoutes=require("./routes/tasks")
const aiRoutes=require("./routes/ai")
const app=express();
const protect=require("./middleware/auth")
app.use(cors({
    origin:['http://localhost:3000','http://localhost:5173','https://ai-task-flow-five.vercel.app','https://www.ai-task-flow-five.vercel.app']
}));

app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/tasks",protect,taskRoutes)
app.use("/api/ai",protect,aiRoutes)
app.get("/",(req,res)=>{
    res.json({message:"AI TaskFlow API is running 🚀"})
});

app.get("/api/me",protect,(req,res)=>{
    res.json({user:req.user})
})


const Port=process.env.PORT || 5000;

app.listen(Port,()=>console.log(`Serve is running at Port number ${Port}`))
