const store = require("../models/diagramStore");

function index(req, res) {
  res.render("index", { diagrams: store.findAll(), user: req.user });
}

function showItem(req, res, next) {
  const id = Number(req.params.id);
  const diagram = store.findById(id);
  if (!diagram) {
    return next();
  }
  res.render("item", { diagram, user: req.user });
}

function showAddForm(req, res) {
  res.render("add", { error: null, values: { title: "", notation: "" }, user: req.user });
}

function submitAddForm(req, res) {
  const { title, notation } = req.body;
  if (!title || !notation) {
    return res.status(400).render("add", {
      error: "title и notation обязательны",
      values: { title: title || "", notation: notation || "" },
      user: req.user,
    });
  }
  store.create({ title, notation });
  res.redirect("/");
}

module.exports = { index, showItem, showAddForm, submitAddForm };
