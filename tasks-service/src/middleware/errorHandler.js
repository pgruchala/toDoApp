const errorHandler = (err, req, res, next) => {
    console.error('Wystąpił błąd:', err);
  
    let error = { ...err };
    error.message = err.message;
  
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      const message = `Nie znaleziono zasobu (niepoprawny format ID: ${err.value})`;
      error = { statusCode: 404, message: message };
    }
  
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      error = { statusCode: 400, message: 'Błąd walidacji', errors: messages };
    }
  
    if (err.code === 11000) {
        const message = 'Wartość unikalnego pola już istnieje w bazie.';
        error = { statusCode: 400, message: message};
    }
  
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Błąd wewnętrzny serwera';

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(error.errors && { validationErrors: error.errors })
    });
  };
  
  module.exports = errorHandler;