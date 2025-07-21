import joi from "joi"

const valiadateUserRegistration = (data) => {
    const schema = joi.object({
        username : joi.string().min(3).max(30).required(),
        email : joi.string().email().required(),
        password : joi.string().min(6).required()
    })
    return schema.validate(data)
}

export default valiadateUserRegistration;