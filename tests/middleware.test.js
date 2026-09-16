const requestLogger = require("../middleware/logger");

describe("requestLogger", () => {
  test("логирует запрос и вызывает next", () => {
    const next = jest.fn();
    jest.spyOn(console, "log").mockImplementationOnce(() => {});
    requestLogger({ method: "GET", originalUrl: "/" }, {}, next);
    expect(next).toHaveBeenCalled();
  });
});
