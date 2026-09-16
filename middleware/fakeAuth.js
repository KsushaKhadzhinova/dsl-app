function fakeAuth(req, res, next) {
  req.user = req.query.auth === "1" ? { name: "Ксения" } : { name: "Гость" };
  next();
}

module.exports = fakeAuth;
