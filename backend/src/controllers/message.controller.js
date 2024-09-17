import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

// for chating
export const sendMessage = async (req, res) => {
    try {
         const senderId = req.id;
         const receiverId = req.params.id;
         const {message} = req.body;
         console.log(message)

         let conversation = await Conversation.findOne({
            participants:{
                $all:[senderId, receiverId]
            }
         })
         //establish the conversation if not started yet
         if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            })
         }
         const newMessage = await Message.create({
            senderId,
            receiverId,
            message
         })

         if(newMessage) {
            conversation.messages.push(newMessage._id)
         }
         await Promise.all([conversation.save(),newMessage.save()])

         //implement socket io for real time data transfer

         return res
         .status(210)
         .json({
            success:true, 
            newMessage
        })
    } catch (error) {
        console.log(error)
    }
}

export const getMessage = async(req, res)  => {
    try {
        const  senderId = req.id;
        const receiverId = req.params.id;
        const conversation =  await Conversation.find({
            participants:{$all:[senderId, receiverId]}
        });
        console.log(conversation)
        if(! conversation){
            return res
            .status(200)
            .json({
                success:true,
                message:[]
            })
        }

        return res
        .status(200)
        .json({
            success:true,

            message: conversation?.messages.message
        })

    } catch (error) {
        
    }
}
