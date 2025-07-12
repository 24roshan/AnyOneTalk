export const editMessage=async(req,res)=>{
    const{id}=req.params;
    const {newContent}=req.body;
    const userId=req.user.id;
    const message=await db.getMessageById(id);
    if(!message || message.senderId !=userId)return res.status(403).json({error:"Not allowed"});
    await db.updateMessage(id,newContent);
    io.emit("messageEdited",{id,newContent});
    res.json({success:true});
};
export const deleteMessage=async(req,res)=>{
    const {id}=req.params;
    const userId=req.user.id;
    const message=await db.getMessageById(id);
    if(!message || message.SenderId !==userId)return res.status(403).json({ error: "Not allowed" }); 
    await db.softDeleteMessage(id);
    io.emit("messageDeleted",{id});
    res.json({success:true});
};