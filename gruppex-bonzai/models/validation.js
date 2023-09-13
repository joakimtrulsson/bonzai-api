const validationBody =(requiredFields, body) => {
    const errors = [];
    requiredFields.forEach((field) => {
        if (!body[field]) {
            errors.push(field);
        }
    });
    return errors;
}

module.exports = validationBody