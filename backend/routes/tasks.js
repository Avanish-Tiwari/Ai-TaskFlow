const express=require("express");
const prisma=require("../lib/prisma");
const router=express.Router();

router.get("/",async (req,res)=>{
    try{
        const tasks=await prisma.task.findMany({
            where:{userId:req.user.id},
            orderBy:{createdAt:"desc"}
        });
        res.json(tasks)
    }catch(err){
        res.status(500).json({error:`Internal server Error ${err.message}`})
    }
});

router.post("/",async (req,res)=>{
    const {text, tag, priority}=req.body;
    if(!text){
        return res.status(400).json({error:"Text is required"})
    }
    const task=await prisma.task.create({
        data:{
            text,
            tag:tag ||'personal',
            priority:priority ||'medium',
            userId:req.user.id
        }
    });

    res.status(201).json(task)
})

router.patch("/:id",async (req,res)=>{
   const task=await prisma.task.findUnique({
    where:{id:req.params.id}
   });

   if(!task){
    return res.status(404).json({error:"Task not found"})
   }
   if(task.userId!==req.user.id){
    return res.status(403).json({error:"Not allowed"})
   }
   const update=await prisma.task.update({
    where:{id:req.params.id},
    data:req.body
   })
   res.json(update);


})

router.delete("/:id",async (req,res)=>{
    const task=await prisma.task.findUnique({
        where:{id:req.params.id}
    });

    if(!task){
        return res.status(404).json({error:"Task not Found"})
    }

    if(task.userId!==req.user.id){
        return res.status(403).json({error:"Not allowed"})
    }

    await prisma.task.delete({
        where:{id:req.params.id}
    });
    res.json({message:"Task deleted"})
})

module.exports = router;
