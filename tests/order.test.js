const Order = require('../class_order.js')

test('getClosingOrder() returns correct data', async () => {
  let order_json = { "t": "unknown", "a": 10 }
  let order = new Order("first_account", "RCC/BTC", order_json)
  expect(order.getClosingOrder(["buy", 12])).toEqual(["sell", 12]);
  expect(order.getClosingOrder(["sell", 34])).toEqual(["buy", 34]);
});

let order_types = ["limit_buy", "limit_sell", "market_buy", "market_sell", "stop_market_buy", "stop_market_sell" ]

order_types.forEach(function(type){

  test(type + ' is handled properly', async () => {
    let order_json = { "t": type, "a": 10 }
    let order = new Order("testExchange1", "RCC/BTC", order_json)
    let markets = await eval(testExchange1).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe('executed ' + order_json.t);
    });
  });

});

test('"unknown" type is handled properly', async () => {
  let order_json = { "t": "unknown", "a": 10 }
  let order = new Order("testExchange1", "RCC/BTC", order_json)
  let markets = await eval(testExchange1).loadMarkets();

  return order.process().then(data => {
    expect(data).toBe("Error: Unknown type unknown");
  });
});

test('scaled order should return 10 orders with 1.0 step', () => {
  let order_json = { "t": "scaled_buy", "a": 12, "from": 100, "to": 90, "num": 10 }
  let order = new Order("testExchange1", "RCC/BTC", order_json)
  expect(order.getScaledOrderPrices()).toEqual(["90.00", "91.00", "92.00", "93.00", "94.00", "95.00", "96.00", "97.00", "98.00", "99.00", "100.00"]);
});

test('scaled order should return 20 orders with 1.0 step', () => {
  let order_json = { "t": "scaled_buy", "a": 22, "from": 100, "to": 80, "num": 20 }
  let order = new Order("testExchange1", "RCC/BTC", order_json)
  expect(order.getScaledOrderPrices()).toEqual(["80.00", "81.00", "82.00", "83.00", "84.00", "85.00", "86.00", "87.00", "88.00", "89.00", "90.00", "91.00", "92.00", "93.00", "94.00", "95.00", "96.00", "97.00", "98.00", "99.00", "100.00"]);
});

test('scaled order should return 20 orders with 0.5 step', () => {
  let order_json = { "t": "scaled_buy", "a": 12, "from": 100, "to": 90, "num": 20 }
  let order = new Order("testExchange1", "RCC/BTC", order_json)
  expect(order.getScaledOrderPrices()).toEqual(["90.00", "90.50", "91.00", "91.50", "92.00", "92.50", "93.00", "93.50", "94.00", "94.50", "95.00", "95.50", "96.00", "96.50", "97.00", "97.50", "98.00", "98.50", "99.00", "99.50", "100.00"]);
});

test('"scaled_buy" type is handled properly', async () => {
  let order_json = { "t": "scaled_buy", "a": 12, "from": 100, "to": 90, "num": 10 }
  let order = new Order("testExchange1", "RCC/BTC", order_json)
  let markets = await eval(testExchange1).loadMarkets();

  return order.process().then(data => {
    expect(data).toBe("executed scaled_buy");
  });
});

test('"scaled_sell" type is handled properly', async () => {
  let order_json = { "t": "scaled_sell", "a": 12, "from": 90, "to": 100, "num": 10 }
  let order = new Order("testExchange1", "RCC/BTC", order_json)
  let markets = await eval(testExchange1).loadMarkets();

  return order.process().then(data => {
    expect(data).toBe("executed scaled_sell");
  });
});