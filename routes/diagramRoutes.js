const express = require("express");
const controller = require("../controllers/diagramController");

const router = express.Router();

router.get("/", controller.index);
router.get("/item/:id", controller.showItem);
router.get("/add", controller.showAddForm);
router.post("/add", controller.submitAddForm);

module.exports = router;
