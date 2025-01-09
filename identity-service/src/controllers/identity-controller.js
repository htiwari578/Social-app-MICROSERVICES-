const { date } = require('joi')
const RefreshToken = require('../models/RefreshToken')
const User = require('../models/user')
const generateToken = require('../utils/generateToken')
const logger = require('../utils/logger')
const { validateRegistration, validateLogin } = require('../utils/validation')
// user registration

const registerUser = async (req,res)=> {
    logger.info('Registration endpoint hit..')
    try {

        const {error} = validateRegistration(req.body)
        if(error){
            logger.warn('Validation error' , error.details[0].message)
            return res.status(400).json({
                message: error.details[0].message,
                success:false
            })
        }
        const {email,password,username} = req.body
        let user = await User.findOne({$or : [{email}, {username}]})
        if(user){
            logger.warn('User already exist');
            return res.status(409).json({
                success: false,
                message: 'User already exists with the provided email or username.'
            });
        }
        user = new User({
            username,
            email,
            password
        })
        await user.save()
        logger.warn('User saved succesfully',user._id)

        const {accessToken,refreshToken} = await generateToken(user);
        res.status(201).json({
            message:"User registered succesfully",
            success:true,
            accessToken,refreshToken,
        })


    } catch (error) {
       logger.error('Registration error occured', error)
       res.status(500).json({
        success:false,
        message:"Server error"
       })
    }
}
// user login
const loginUser = async (req,res) => {
    logger.info("Login endpoint hit...");
    try {
        const {error} = validateLogin(req.body)
        if(error){
            logger.warn("Validation error", error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message 
            });
        }
        const {email , password} = req.body
        const user = await User.findOne ({email})

        if(!user) {
            logger.warn('Inavalid user')
            return res.status(400).json({
                success: false,
                message:"Invalid credentials"
            })
        }
        //  valid password or not
        const isValidPassword = await user.comparePassword( password)
        if(! isValidPassword ){
            logger.warn('Inavalid password')
            return res.status(400).json({
                success:false,
                message:"Wrong password"
            })
        }
        const {accessToken , refreshToken } = await generateToken(user)
        res.json({
            accessToken,
            refreshToken,
            userId: user._id
        })


    } catch (error) {
        logger.error('Login error occured', error)
        res.status(500).json({
         success:false,
         message:"Server error"
        })
    }
}



//refresh token
const refreshTokenUser = async (req, res) => {
    logger.info("Refresh token endpoint hit..")
    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn('Refresh token missing')
            return res.status(400).json({
                message:'Refresh token missing',
                success:false
            })
        }
        const storeToken = await RefreshToken.findOne({token : refreshToken})
        if(!storeToken || storeToken.expiresAt < new Date()){
            logger.warn('Inavalid or expired refresh token')

            return res.status(401).json({
                success: false,
                message : 'Inavalid or expired refresh token'
            })
        }

        const user = await User.findById(storeToken.user)
        if(!user){
            logger.warn('User not found')
            return res.status(401).json({
                message:'User not found',
                success:false
            })
        }

        // now generate new token
        const {accessToken : newAccessToken , refreshToken : newRefreshToken} = await generateToken(user)

        // delete the old refresh token
        await RefreshToken.deleteOne({_id: storeToken._id})

        res.json({
            accessToken : newAccessToken ,
            refreshToken : newRefreshToken
        })
    } catch (error) {
        logger.error('Refresh token error occured', error)
        res.status(500).json({
         success:false,
         message:"Server error"
        })
    }
}

//logout 
const logoutUser = async (req,res) => {
    logger.info('Logout end point hit..')
    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn("Refresh token is missing")
            return res.status(400).json({
                success:false,
                message:"Refresh token missing"
            });
        }
        await RefreshToken.deleteOne({token : refreshToken})
        logger.warn('Refresh token deleted from logout')

        res.json({
            success:true,
            message: 'Logged out successfully'
        })
    } catch (error) {
        logger.error('error while logging out', error)
        res.status(500).json({
         success:false,
         message:"Server error"
        })
    }

}

module.exports = {registerUser, 
    loginUser, 
    refreshTokenUser,
    logoutUser
};