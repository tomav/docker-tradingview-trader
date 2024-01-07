const Order = require('../class_order.js')

describe('required params', () => {

  ["limit_buy", "limit_sell", "stop_market_buy", "stop_market_sell" ].forEach(function(type){
    test(type + ' returns error if "amount" is missing', () => {
      let order_json = { "t": type, "p": 10 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'a'");
    });
    test(type + ' returns error if "amount" is null', () => {
      let order_json = { "t": type, "p": 10, a: null }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'a'");
    });
    test(type + ' returns error if "price" is missing', () => {
      let order_json = { "t": type, "a": 10 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'p'");
    });
  });

  ["market_buy", "market_sell"].forEach(function(type){
    test(type + ' returns error if "amount" is missing', () => {
      let order_json = { "t": type, "p": 10 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'a'");
    });
  });

  ["scaled_buy", "scaled_sell"].forEach(function(type){
    test(type + ' returns error if "amount" is missing', () => {
      let order_json = { "t": type, "p": 10, "u": 100, "l": 90, "n": 10 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'a'");
    });
    test(type + ' returns error if "upper" is missing', () => {
      let order_json = { "t": type, "a": 10, "p": 10, "l": 90, "n": 10 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'u'");
    });
    test(type + ' returns error if "lower" is missing', () => {
      let order_json = { "t": type, "a": 10, "p": 10, "u": 100, "n": 10 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'l'");
    });
    test(type + ' returns error if "number" is missing', () => {
      let order_json = { "t": type, "a": 10, "p": 10, "u": 100, "l": 90 }
      expect(() => new Order("first_account", "BTC/USDC", order_json)).toThrow("Parameter 'n'");
    });
  });

});

describe('test orders', () => {

  test('getClosingOrder() returns correct data', async () => {
    let order_json = { "t": "limit_buy", "a": 10, "p": 10}
    let order = new Order("first_account", "BTC/USDC", order_json)
    expect(order.getClosingOrder(["buy", 12])).toEqual(["sell", 12]);
    expect(order.getClosingOrder(["sell", 34])).toEqual(["buy", 34]);
  });

  let order_types = ["limit_buy", "limit_sell", "scaled_buy", "scaled_sell", "market_buy", "market_sell", "stop_market_buy", "stop_market_sell" ]

  order_types.forEach(function(type){

    test(type + ' is handled properly', async () => {
      let order_json = { "t": type, "a": 10, "p": 10, "u": 100, "l": 90, "n": 10 }
      let order = new Order("first_account", "BTC/USDC", order_json)
      let markets = await eval(first_account).loadMarkets();

      return order.process().then(data => {
        expect(data).toBe('executed ' + order_json.t);
      });
    });

  });

  test('% amount is handled properly', async () => {
    let order_json = { "t": "market_buy", "a": "10%" }
    let order = new Order("first_account", "BTC/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe('executed ' + order_json.t);
    });
  });

  test('"unknown" type is handled properly', async () => {
    let order_json = { "t": "unknown", "a": 10 }
    let order = new Order("first_account", "BTC/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("Error: Unknown type unknown");
    });
  });

  test('"scaled_buy" type is handled properly', async () => {
    let order_json = { "t": "scaled_buy", "a": 12, "u": 100, "l": 90, "n": 10 }
    let order = new Order("first_account", "BTC/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("executed scaled_buy");
    });
  });

  test('"scaled_sell" type is handled properly', async () => {
    let order_json = { "t": "scaled_sell", "a": 12, "u": 90, "l": 100, "n": 10 }
    let order = new Order("first_account", "BTC/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("executed scaled_sell");
    });
  });

  test('"close_position" type is handled properly when a position exists', async () => {
    let order_json = { "t": "close_position" }
    let order = new Order("first_account", "BTC/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("executed close_position");
    });
  });

  test('"close_position" type is handled properly when there\'s no position', async () => {
    let order_json = { "t": "close_position" }
    let order = new Order("first_account", "ETH/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("No position, nothing to close.");
    });
  });

  test('"debug" type is handled properly', async () => {
    let order_json = { "t": "debug", "a": 10, "p": 10, "u": 100, "l": 90, "n": 10 }
    let order = new Order("first_account", "ETH/USDC", order_json)
    let markets = await eval(first_account).loadMarkets();

    return order.process().then(data => {
      expect(data).toBe("executed debug order");
    });
  });

});
