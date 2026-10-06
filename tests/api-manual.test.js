// tests/api-manual.test.js
const request = require("supertest");
const createApp = require("../app");
const db = require("../models/db");

let app;
let token;
let diagramId;

const TEST_EMAIL = "script-test@example.com";
const TEST_PASSWORD = "Str0ngPwd123!";

beforeAll(async () => {
  app = createApp();
  // Для тестов используется SQLite in-memory, sync вызываем у sequelize
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

test("регистрация пользователя", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

  expect(res.status).toBe(201);
  expect(res.body.email).toBe(TEST_EMAIL.toLowerCase());
});

test("логин и получение токена", async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  token = res.body.token;
});

test("создание диаграммы", async () => {
  const res = await request(app)
    .post("/diagrams")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Тестовая диаграмма",
      notation: "erd",
      status: "draft",
    });

  expect(res.status).toBe(201);
  expect(res.body.id).toBeDefined();
  diagramId = res.body.id;
});

test("получение списка диаграмм", async () => {
  const res = await request(app)
    .get("/diagrams")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("получение диаграммы по id", async () => {
  const res = await request(app)
    .get(`/diagrams/${diagramId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.id).toBe(diagramId);
});

test("обновление диаграммы", async () => {
  const res = await request(app)
    .put(`/diagrams/${diagramId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Обновлённая диаграмма",
      status: "validated",
    });

  expect(res.status).toBe(200);
  expect(res.body.title).toBe("Обновлённая диаграмма");
  expect(res.body.status).toBe("validated");
});

test("удаление диаграммы", async () => {
  const res = await request(app)
    .delete(`/diagrams/${diagramId}`)
    .set("Authorization", `Bearer ${token}`);

  expect([200, 204]).toContain(res.status);
});

test("404 для несуществующей диаграммы", async () => {
  const res = await request(app)
    .get("/diagrams/999999")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(404);
});

test("401 при запросе без токена", async () => {
  const res = await request(app).get("/diagrams");

  expect(res.status).toBe(401);
});