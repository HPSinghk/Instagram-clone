import express from  'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getMessage, sendMessage } from '../controllers/message.controller.js';
import { upload }  from '../middlewares/multer.js'



const router =  express.Router();

router.route('/send/:id').post(
    isAuthenticated,
    upload.none(),
    sendMessage
)
router.route('/all/:id').post(
    isAuthenticated,
    upload.none(),
    getMessage
)


export default  router;
