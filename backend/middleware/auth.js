const jwt=require("jsonwebtoken");
const prisma=require("../lib/prisma");

const protect=async (req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({error:`Invalid token`})
    }
    const token=authHeader.split(" ")[1];
    const decode=jwt.verify(token,process.env.JWT_SECRET);

    const user=await prisma.user.findUnique({
        where:{id:decode.id},
        select:{id:true,name:true,email:true}
    });
    if(!user){
        return res.status(401).json({error:"User no longer exist"})
    }
    req.user=user;
    next();


}
module.exports=protect;