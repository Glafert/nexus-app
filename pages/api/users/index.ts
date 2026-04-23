
import { prisma } from "../../../lib/prisma";

export default async function handler(req:any,res:any){
  if(req.method==="GET"){
    const users = await prisma.user.findMany();
    return res.json(users);
  }
  if(req.method==="POST"){
    const {username,password,role} = req.body;
    const user = await prisma.user.create({
      data:{username,password,role}
    });
    return res.json(user);
  }
}
