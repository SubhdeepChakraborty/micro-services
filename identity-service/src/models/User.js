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
  searchString : {
    type : String,
    index : true,
  }
},
{
    timestamps : true //This will add createdAt and updatedAt
});

//Hash pssword
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    if (this.isModified("password")) {
      this.password = await argon2.hash(this.password);
    }

    if (this.isModified("username") || this.isModified("email")) {
      this.searchString =
        `${this.username.trim()} ${this.email.trim()}`.toLowerCase();
    }
    next();
  } catch (error) {
    console.error(error.stack);
    next(err);
  }
});

//Optionally hide sensitive fields
userSchema.methods.toJSON = function(){
    const obj = this.toObject();
    delete obj.password
    return obj
}

//compared password
userSchema.methods.comparedPassword = async function (candidatePassword) {
  try {
    console.log(this.password, 'password')
    return await argon2.verify(this.password, candidatePassword.trim())
  } catch (error) {
    console.error(error.stack)
    throw new Error('Error comparing password')
  }
}

const User = mongoose.model('user', userSchema)

export default User;