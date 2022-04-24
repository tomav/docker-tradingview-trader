const Order = require('../class_order.js')

describe('required params', () => {

  ["limit_buy", "limit_sell", "stop_market_buy", "stop_market_sell" ].forEach(function(type){
    test(type + ' returns error if "amount" is missing', () => {
      let order_json = { "t": type, "p": 10 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'a'");
    });
    test(type + ' returns error if "price" is missing', () => {
      let order_json = { "t": type, "a": 10 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'p'");
    });
  });


  ["market_buy", "market_sell"].forEach(function(type){
    test(type + ' returns error if "amount" is missing', () => {
      let order_json = { "t": type, "p": 10 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'a'");
    });
  });

  ["scaled_buy", "scaled_sell"].forEach(function(type){
    test(type + ' returns error if "amount" is missing', () => {
      let order_json = { "t": type, "p": 10, "u": 100, "l": 90, "n": 10 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'a'");
    });
    test(type + ' returns error if "upper" is missing', () => {
      let order_json = { "t": type, "a": 10, "p": 10, "l": 90, "n": 10 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'u'");
    });
    test(type + ' returns error if "lower" is missing', () => {
      let order_json = { "t": type, "a": 10, "p": 10, "u": 100, "n": 10 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'l'");
    });
    test(type + ' returns error if "number" is missing', () => {
      let order_json = { "t": type, "a": 10, "p": 10, "u": 100, "l": 90 }
      expect(() => new Order("testExchange1", "RCC/BTC", order_json)).toThrow("Parameter 'n'");
    });
  });


});

describe('test orders', () => {

  test('getClosingOrder() returns correct data', async () => {
    let order_json = { "t": "limit_buy", "a": 10, "p": 10}
    let order = new Order("first_account", "RCC/BTC", order_json)
    expect(order.getClosingOrder(["buy", 12])).toEqual(["sell", 12]);
    expect(order.getClosingOrder(["sell", 34])).toEqual(["buy", 34]);
  });

  let order_types = ["limit_buy", "limit_sell", "scaled_buy", "scaled_sell", "market_buy", "market_sell", "stop_market_buy", "stop_market_sell" ]

  order_types.forEach(function(type){

    test(type + ' is handled properly', async () => {
      let order_json = { "t": type, "a": 10, "p": 10, "u": 100, "l": 90, "n": 10 }
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
    let order_json = { "t": "scaled_buy", "a": 12, "u": 100, "l": 90, "n": 10 }
    let order = new Order("testExchange1", "RCC/BTC", order_json)
    expect(order.getScaledOrderPrices()).toEqual(["90.00", "91.00", "92.00", "93.00", "94.00", "95.00", "96.00", "97.00", "98.00", "99.00", "100.00"]);
  });

  test('scaled order should return 20 orders with 1.0 step', () => {
    let order_json = { "t": "scaled_buy", "a": 22, "u": 100, "l": 80, "n": 20 }
    let order = new Order("testExchange1", "RCC/BTC", order_json)
    expect(order.getScaledOrderPrices()).toEqual(["80.00", "81.00", "82.00", "83.00", "84.00", "85.00", "86.00", "87.00", "88.00", "89.00", "90.00", "91.00", "92.00", "93.00", "94.00", "95.00", "96.00", "97.00", "98.00", "99.00", "100.00"]);
  });

  test('scaled order should return 20 orders with 0.5 step', () => {
    let order_json = { "t": "scaled_buy", "a": 12, "u": 100, "l": 90, "n": 20 }
    let order = new Order("testExchange1", "RCC/BTC", order_json)
    expect(order.getScaledOrderPrices()).toEqual(["90.00", "90.50", "91.00", "91.50", "92.00", "92.50", "93.00", "93.50", "94.00", "94.50", "95.00", "95.50", "96.00", "96.50", "97.00", "97.50", "98.00", "98.50", "99.00", "99.50", "100.00"]);
  });

  test('"scaled_buy" type is handled properly', async () => {
    let order_json = { "t": "scaled_buy", "a": 12, "u": 100, "l": 90, "n": 10 }
    let order = new Order("testExchange1", "RCC/BTC", order_json)
    let markets = await eval(testExchange1).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("executed scaled_buy");
    });
  });

  test('"scaled_sell" type is handled properly', async () => {
    let order_json = { "t": "scaled_sell", "a": 12, "u": 90, "l": 100, "n": 10 }
    let order = new Order("testExchange1", "RCC/BTC", order_json)
    let markets = await eval(testExchange1).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("executed scaled_sell");
    });
  });

});
