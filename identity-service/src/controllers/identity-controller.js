
//First we need the logger as its important
import logger from "../utils/logger.js"
//Validation utility
import {valiadateUserRegistration, valiadateUserLogin } from "../utils/validate.js"
//Importing the User model
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"
import RefreshToken from "../models/refreshToken.js"

//User-registration 
const registerUser = async(req, res) => {
    logger.info('Registration endpoint hit...')
    try {
      //Validate the schema
      const { error } = valiadateUserRegistration(req.body);
      if (error) {
        logger.warn("Validation error", error.details[0].message);
        return res.status(400).send({
          status: false,
          message: error.details[0].message,
        });
      }
      const { username, email, password, role } = req.body;
      let user = await User.findOne({
        $or: [{ email }, { username }],
      });
      //If the user already exists
      if (user) {
        logger.warn("User already exists with this email or username");
        return res.status(400).send({
          status: false,
          message: "User already exists with this email or username",
        });
      }
      //create a new user
      user = new User({
        username,
        email,
        password,
        role
      });

      await user.save()
      logger.info('User registration successful', user.email);
      
      //Generate token for the user
      const {accessToken, refreshToken} = await generateToken(user);

      return res.status(200).send({
        status : true,
        message : 'User registration successful!',
        data : [
            {
                userId : user._id,
                username : user.username,
                email : user.email,
                accessToken,
                refreshToken
            }
        ]
      })

    } catch (error) {
        logger.error('Error occurred during user registration', error)
        return res.status(500).send({
            status : false,
            message : 'Internal server error'
        })
    }
}

//User login
const loginUser = async (req, res) => {
  logger.info("Login endpoint hit...");
  try {
    const { error } = valiadateUserLogin(req.body);
    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.warn("User not found with this email");
      return res.status(404).send({
        status: false,
        message: "User not found with this email",
      });
    }
    //If present
    const isValidPassword = await user.comparedPassword(password);
    logger.info('password : ', isValidPassword)
    if (!isValidPassword) {
      logger.warn("User password didn't matched.");
      return res.status(400).send({
        status: false,
        message: "User password didn't matched.",
      });
    }

    const { accessToken, refreshToken} = await generateToken(user);

    return res.status(200).send({
      status : true,
      message : 'User login successful',
      data : [
        {
          userId : user._id,
          username : user.username,
          accessToken,
          refreshToken
        }
      ]
    })

  } catch (error) {
    logger.error("Error occurred during user login", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};


//refresh token
const refreshToken = async(req, res) => {
  logger.info('Refresh token endpoint hit...')
  try {
    const {refreshToken} = req.body
    if(!refreshToken){
      logger.warn('Refresh token is required')
      return res.status(400).send({
        status : false,
        message : 'Refresh token is required'
      })
    }
    //Verify the refresh token
    const storedToken = await RefreshToken.findOne({token : refreshToken})
    if(!storedToken || storedToken.expiresAt < new Date()){
      logger.warn('Invalid refresh token')
      return res.status(400).send({
        status : false,
        message : 'Invalid refresh token'
      })
    }

    //find the user
    const user = await User.findById(storedToken.user)
    if(!user){
      logger.warn('User not found')
      return res.status(404).send({
        status : false,
        message : 'User not found'
      })
    }

    //Generate new acess token
    const {accessToken : newAcessToken, refreshToken : newRefreshToken} = await generateToken(user)

    //delete the old refresh token
    await RefreshToken.deleteOne({_id : storedToken._id})

    return res.status(201).send({
      status : true,
      message : 'New acess token generated successfully',
      data : [
        {
          userId : user._id,
          username : user.username,
          accessToken : newAcessToken,
          refreshToken : newRefreshToken
        }
      ]
    })

  } catch (error) {
    logger.error('Error occured during refresh token', error)
     return res.status(500).send({
       status: false,
       message: "Internal server error",
     });
  }
}


//logout
const logoutUser = async(req, res) => {
  logger.info('Logout endpoint hit...')
  try {
    
    const {refreshToken} = req.body;
     if (!refreshToken) {
       logger.warn("Refresh token is required");
       return res.status(400).send({
         status: false,
         message: "Refresh token is required",
       });
     }

     await RefreshToken.deleteOne({token : refreshToken})

     logger.info('User logout refresh token deleted successfully')

     return res.status(200).send({
       status: true,
       message: 'User logged out successfully'
     })

  } catch (error) {
    logger.error("Error occured during refresh token", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
}


export { registerUser, loginUser, refreshToken, logoutUser };