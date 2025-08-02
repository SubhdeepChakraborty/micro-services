import jwt from 'jsonwebtoken'
import crypto from "crypto"
import RefreshToken from '../models/refreshToken.js';
import logger from './logger.js';

const generateToken = async(user) => {
    try {

        const accessToken = jwt.sign(
          {
            userId: user._id,
            username: user.username,
            role: user.role,
          },
          process.env.JWT_SECRET , {
            expiresIn : '60m'
          }
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 days

        await RefreshToken.create({
            token : refreshToken,
            user : user._id,
            expiresAt : expiresAt
        })

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        logger.error('Error generating token', error.stack())
        throw new Error('Error generating token')
    }
}

export default generateToken;