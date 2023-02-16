const Joi = require("@hapi/joi");

module.exports.validateRegister = function validateRegister(data) {
  const schema = Joi.object({
    displayName: Joi.string().min(3).required(),
    username: Joi.string().alphanum().min(3).required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    profileImage: Joi.string().allow(""),
  });

  return schema.validate(data);
};

module.exports.validateLogin = function validateLogin(data) {
  const schema = Joi.object({
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};

module.exports.validatePost = function validatePost(data) {
  const schema = Joi.object({
    content: Joi.string().required(),
  });

  return schema.validate(data);
};
