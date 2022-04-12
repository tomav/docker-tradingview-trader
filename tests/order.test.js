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
