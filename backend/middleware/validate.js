const dayjs = require('dayjs');

const validate = (rules) => (req, res, next) => {
  const errors = [];

  for (const [field, checks] of Object.entries(rules)) {
    const value = req.body[field];

    for (const check of checks) {
      const result = check(value, field);
      
      if (result !== true) {
        errors.push(result);
        break;
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }

  next();
};

const isRequired = (msg = 'Missing :field') => (value, field) => {
  if (value === undefined || value === null || value === '') {
    return msg.replace(':field', field);
  }
  
  return true;
};

const isString = (maxLength, msg) => (value, field) => {
  if (value === undefined || value === null) return true;
  
  const str = String(value);
  
  if (maxLength && str.length > maxLength) {
    return (msg || `:field too long`).replace(':field', field);
  }
  
  return true;
};

const isNumber = (msg = 'Invalid :field') => (value, field) => {
  if (value === undefined || value === null) return true;
  if (isNaN(value)) return msg.replace(':field', field);
  
  return true;
};

const isOneOf = (values, msg) => (value, field) => {
  if (value === undefined || value === null) return true;
  if (!values.includes(value)) return (msg || `Invalid :field`).replace(':field', field);
  
  return true;
};

const isValidDate = (msg = 'Invalid :field') => (value, field) => {
  if (!value) return msg.replace(':field', field);
  if (!dayjs(value).isValid()) return msg.replace(':field', field);
  
  return true;
};

const isValidAmount = (msg = 'Invalid :field') => (value, field) => {
  if (value === undefined || value === null) return true;
  
  const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  
  if (isNaN(parsed)) return msg.replace(':field', field);
  
  return true;
};

module.exports = {
  validate,
  isRequired,
  isString,
  isNumber,
  isOneOf,
  isValidDate,
  isValidAmount,
};
