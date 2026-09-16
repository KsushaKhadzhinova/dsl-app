const express = require("express");
const path = require("path");
const diagramRoutes = require("./routes/diagramRoutes");
const requestLogger = require("./middleware/logger");
const fakeAuth = require("./middleware/fakeAuth");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(fakeAuth);
  app.use("/", diagramRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
