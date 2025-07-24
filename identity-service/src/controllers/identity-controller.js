
//First we need the logger as its important
import logger from "../utils/logger.js"
//Validation utility
import valiadateUserRegistration from "../utils/validate.js"
//Importing the User model
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"

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



//refresh token



//logout



export {
    registerUser
}