test('getAccountByExchange() returns correct data', () => {
  expect(global.config.getAccountByExchange("testExchange1")).toBe("first_account");
  expect(global.config.getAccountByExchange("testExchange2")).toBe("second_account");
  expect(() => global.config.getAccountByExchange("unknown_exchange")).toThrow("No exchange named 'undefined'");
});

test('getExchangeByAccount() returns correct data', () => {
  expect(global.config.getExchangeByAccount("first_account")).toBe("testExchange1");
  expect(global.config.getExchangeByAccount("second_account")).toBe("testExchange2");
  expect(() => global.config.getExchangeByAccount("unknown_account")).toThrow("No account named 'undefined'");
});

test('getAccountParams() returns correct data', () => {
  expect(global.config.getAccountParams("first_account")).toStrictEqual({ "currency": "BTC" });
  expect(global.config.getAccountParams("second_account")).toStrictEqual({ "currency": "ETH" });
  expect(global.config.getAccountParams("third_account")).toStrictEqual({});
  expect(() => global.config.getAccountParams("unknown_account")).toThrow("No account named 'unknown_account'");
});

