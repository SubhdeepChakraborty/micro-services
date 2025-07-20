import mongoose from "mongoose"
import argon2 from "argon2"

//Creating userSchema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select : false
  },
  role : {
    type: String,
    enum : ['user', 'admin'],
    default : 'user'
  },
},
{
    timestamps : true //This will add createdAt and updatedAt
});

//Hash pssword
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    try {
        this.password = await argon2.hash(this.password)
        next()
    } catch (error) {
        console.error(error.stack)
        next(err)
    }
})

//Optionally hide sensitive fields
userSchema.methods.toJSON = function(){
    const obj = this.toObject();
    delete obj.password
    return obj
}

const User = mongoose.model('user', userSchema)

export default User;