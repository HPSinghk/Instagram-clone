import jwt from  'jsonwebtoken';

const isAuthenticated = async(req, res, next) => {
    try {
        const token = req.cookie.token;
        if(!token){
            return res
            .status(401)
            .json({
                message: 'User not authorized',
                success:false
            });
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res
            .status(401)
            .json({
                message: 'Invalid',
                success:false
            });
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        comsole.log(error)
    }
}