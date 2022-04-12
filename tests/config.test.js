test('getAccountByExchange() returns correct data', () => {
  expect(global.config.getAccountByExchange("testExchange1")).toBe("first_account");
  expect(global.config.getAccountByExchange("testExchange2")).toBe("second_account");
});

test('getExchangeByAccount() returns correct data', () => {
  expect(global.config.getExchangeByAccount("first_account")).toBe("testExchange1");
  expect(global.config.getExchangeByAccount("second_account")).toBe("testExchange2");
});

test('getAccountParams() returns correct data', () => {
  expect(global.config.getAccountParams("first_account")).toStrictEqual({});
  expect(global.config.getAccountParams("second_account")).toStrictEqual({ "currency": "ETH" });
});

