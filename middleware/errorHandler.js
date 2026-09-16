function notFoundHandler(req, res) {
  res.status(404).render("404", { url: req.originalUrl, user: req.user });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).render("500", { message: err.message || "Внутренняя ошибка сервера", user: req.user });
}

module.exports = { notFoundHandler, errorHandler };
