const Joi = require("joi");

const createAccount = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    Balance: Joi.number().required(),
  });
  return schema.validate(data);
};

module.exports.createAccount = createAccount;
