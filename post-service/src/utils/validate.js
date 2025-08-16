import joi from "joi"

export const validatePost = (post) => {
    const schema = joi.object({
      content: joi.string().max(500).trim().required(),
      mediaId: joi
        .array()
        .items(
          joi.object({
            userId: joi.string().length(24), // ObjectId length
            media: joi.string().length(24),
            mediatype: joi.string().valid("public", "private", "profile").default("public")
          })
        )
        .max(5),
      tags: joi.array().items(joi.string().trim().max(50)),
      location: joi.string().max(100).optional(),
    });

    return schema.validate(post)
}