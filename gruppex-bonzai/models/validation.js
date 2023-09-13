const validationBody = (requiredFields, body) => {
  let errorMessage = '';
  if (requiredFields.length !== Object.keys(body).length) {
    return (errorMessage =
      'Just need to fill in following fields: ' + requiredFields.join(', '));
  }

  for (let index = 0; index < requiredFields.length; index++) {
    const field = requiredFields[index];
    if (!body[field] || body[field] === '') {
      errorMessage = field + ' field is required';
      break;
    }

    if (field === 'checkIn' || field === 'checkOut') {
      const dateFormatRegex = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;
      if (!dateFormatRegex.test(body[field])) {
        errorMessage = field + ' field have to be in format YYYY/MM/DD';
        break;
      }
    }
    if (field === 'totalGuests' && typeof body[field] !== 'number') {
      errorMessage = field + ' field have to be a number';
      break;
    }

    if (field === 'roomId' && !Array.isArray(body[field])) {
      errorMessage = field + ' field have to be an array';
      break;
    }
  }

  return errorMessage;
};

module.exports = validationBody;
