beforeAll(async () => {

  const ccxt = require ('ccxt');
  const mockExchange  = require('ccxt.mock');
  global.testExchange1 = new mockExchange.mock({})
  global.testExchange2 = new mockExchange.mock({})

  let json = {
    "exchanges": [
      {
        "account": "first_account",
        "exchange": "testExchange1",
        "key": "qwerty",
        "secret": "ytrewq"
      }, {
        "account": "second_account",
        "exchange": "testExchange2",
        "key": "qwerty",
        "secret": "ytrewq",
        "params": { "currency": "ETH" }
      }
    ]
  }
 
  const Config = require('./class_config.js')
  global.config = new Config(json)

});

