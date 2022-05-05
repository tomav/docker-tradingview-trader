const Order = require('../class_order.js')

describe('scaled orders', () => {

  test('scaled order should return 10 orders with 1.0 step', () => {
    n = 10
    let order_json = { "t": "scaled_buy", "a": 12, "u": 100, "l": 91, "n": n }
    let order = new Order("first_account", "BTC/USDC", order_json)
    expect(order.getScaledOrderPrices().length).toEqual(n);
    expect(order.getScaledOrderPrices()).toEqual(["91.00", "92.00", "93.00", "94.00", "95.00", "96.00", "97.00", "98.00", "99.00", "100.00"]);
  });

  test('scaled order should return 11 orders with 1.0 step', () => {
    n = 11
    let order_json = { "t": "scaled_buy", "a": 12, "u": 100, "l": 90, "n": n }
    let order = new Order("first_account", "BTC/USDC", order_json)
    expect(order.getScaledOrderPrices().length).toEqual(n);
    expect(order.getScaledOrderPrices()).toEqual(["90.00", "91.00", "92.00", "93.00", "94.00", "95.00", "96.00", "97.00", "98.00", "99.00", "100.00"]);
  });

  test('scaled order should return 11 orders with 0.5 step', () => {
    n = 21
    let order_json = { "t": "scaled_buy", "a": 10, "u": 110, "l": 100, "n": n }
    let order = new Order("first_account", "BTC/USDC", order_json)
    expect(order.getScaledOrderPrices().length).toEqual(n);
    expect(order.getScaledOrderPrices()).toEqual(["100.00", "100.50", "101.00", "101.50", "102.00", "102.50", "103.00", "103.50", "104.00", "104.50", "105.00", "105.50", "106.00", "106.50", "107.00", "107.50", "108.00", "108.50", "109.00", "109.50", "110.00"]);
  });

});