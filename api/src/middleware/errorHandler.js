exports.errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err.response) {
    statusCode = err.response.status || 500;
    message = err.response.data?.message || "Service error";
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
