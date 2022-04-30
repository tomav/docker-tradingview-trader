beforeAll(async () => {

  const ccxt = require ('ccxt');
  const mockExchange  = require('ccxt-faker');
  global.testExchange1 = new mockExchange.fake({})
  global.testExchange2 = new mockExchange.fake({})

  let json = {
    "exchanges": [
      {
        "account": "first_account",
        "exchange": "testExchange1",
        "key": "qwerty",
        "secret": "ytrewq",
        "params": { "currency": "BTC" }
      }, {
        "account": "second_account",
        "exchange": "testExchange2",
        "key": "qwerty",
        "secret": "ytrewq",
        "params": { "currency": "ETH" }
      }, {
        "account": "third_account",
        "exchange": "testExchange3",
        "key": "qwerty",
        "secret": "ytrewq"
      }
    ]
  }
 
  const Config = require('./class_config.js')
  global.config = new Config(json)

});

