const {Prisma} = require('@prisma/client')

const errorHandler = (err, req, res, next) => {
  console.error(`[BŁĄD] ${err.stack}`);

  // Obsługa błędów walidacji Prismy
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Błąd walidacji",
      error: err.message,
    });
  }

  // Obsługa błędów znanych kluczy Prismy
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Kod P2002 oznacza naruszenie unikalności
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "Naruszenie ograniczenia unikalności",
        fields: err.meta?.target,
      });
    }

    // Kod P2003 oznacza naruszenie klucza obcego
    if (err.code === "P2003") {
      return res.status(400).json({
        status: "error",
        message: "Naruszenie ograniczenia klucza obcego",
        error: "Odwoływany zasób nie istnieje",
      });
    }

    // Kod P2025 oznacza, że rekord nie został znaleziony
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Nie znaleziono zasobu",
        error: err.meta?.cause || "Żądany zasób nie istnieje",
      });
    }
  }

  // Domyślna odpowiedź błędu
  return res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Wewnętrzny błąd serwera",
  });
};

module.exports = {
  errorHandler,
};