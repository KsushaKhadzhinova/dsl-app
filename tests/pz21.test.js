const request = require("supertest");
const createApp = require("../app");
const store = require("../models/diagramStore");

const app = createApp();

beforeEach(() => {
  store.reset();
});

describe("GET /", () => {
  test("рендерит пустой список", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Диаграмм пока нет");
  });

  test("рендерит список диаграмм", async () => {
    store.create({ title: "Заказы", notation: "erd" });
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Заказы");
  });

  test("возвращает 500 при ошибке хранилища", async () => {
    jest.spyOn(store, "findAll").mockImplementationOnce(() => {
      throw new Error("сбой хранилища");
    });
    const res = await request(app).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toContain("сбой хранилища");
  });

  test("возвращает сообщение по умолчанию при ошибке без message", async () => {
    jest.spyOn(store, "findAll").mockImplementationOnce(() => {
      throw {};
    });
    const res = await request(app).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toContain("Внутренняя ошибка сервера");
  });
});

describe("GET /item/:id", () => {
  test("рендерит существующую диаграмму", async () => {
    const diagram = store.create({ title: "Заказы", notation: "erd" });
    const res = await request(app).get(`/item/${diagram.id}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain("Заказы");
  });

  test("возвращает 404 для несуществующей диаграммы", async () => {
    const res = await request(app).get("/item/999");
    expect(res.status).toBe(404);
    expect(res.text).toContain("404");
  });
});

describe("GET /add", () => {
  test("рендерит форму добавления", async () => {
    const res = await request(app).get("/add");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Добавить диаграмму");
  });
});

describe("POST /add", () => {
  test("создаёт диаграмму и делает редирект", async () => {
    const res = await request(app).post("/add").type("form").send({ title: "Заказы", notation: "erd" });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/");
    expect(store.findAll()).toHaveLength(1);
  });

  test("возвращает форму с ошибкой при отсутствии title", async () => {
    const res = await request(app).post("/add").type("form").send({ notation: "erd" });
    expect(res.status).toBe(400);
    expect(res.text).toContain("обязательны");
  });

  test("возвращает форму с ошибкой при отсутствии notation", async () => {
    const res = await request(app).post("/add").type("form").send({ title: "Заказы" });
    expect(res.status).toBe(400);
  });
});

describe("неизвестный маршрут", () => {
  test("возвращает 404", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
  });
});

describe("fakeAuth middleware", () => {
  test("устанавливает пользователя при ?auth=1", async () => {
    const res = await request(app).get("/?auth=1");
    expect(res.text).toContain("Ксения");
  });

  test("устанавливает гостя без auth", async () => {
    const res = await request(app).get("/");
    expect(res.text).toContain("Гость");
  });
});
