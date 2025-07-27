import joi from "joi"

export const validatePost = (post) => {
    console.log(post)
    const schema = joi.object({
      content: joi.string().max(500).trim().required(),
      mediaUrl: joi
        .array()
        .items(
          joi.object({
            url: joi
              .string()
              .uri()
              .regex(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|mp4|mov|mkv))$/)
              .required(),
            type: joi.string().valid("image", "video").required(),
          })
        )
        .max(5),
      visibility: joi
        .string()
        .valid("public", "private", "friends")
        .default("public"),
      tags: joi.array().items(joi.string().trim().max(50)),
      location: joi.string().max(100).optional(),
    });

    return schema.validate(post)
}