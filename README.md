# docker-tradingview-trader

This nodejs project allow you to execute trades from Tradingview alerts on most crypto exchanges.

### Usage

* copy `config.json.sample` to `config.json` and fill in the required information
	* `name` is the alias for the exchange (you can have multiple aliases/accounts on 1 exchange)
	* `exchange` is the exchange `id` used in [`ccxt` library](https://github.com/ccxt/ccxt/wiki/Exchange-Markets)
	* `key` & `secret` refer to the API keys you have to generate on each exchange
* mount this config file in your docker container

### Tradingview alert message

#### Real-life example

```
{
	"account": "deribit_main",
	"instrument": "BTC-PERPETUAL",
	"orders": [
		{ "t": "market_buy", "a": 10 },
		{ "t": "limit_buy", "a": 10, "p": 35000 },
		{ "t": "stop_market_sell", "a": 20, "p": 30000 }
	]
}
``` 

This example will open a market position, place a limit buy order, and set a stop order.

#### Params

* `t` (type)   => order type must have one of the following value:
	* `limit_buy` at specified price
	* `limit_sell` at specified price
	* `market_buy` at current price
	* `market_sell` at current price
	* `stop_market_buy` at specified price
	* `stop_market_sell` at specified price
	* `close_position` and cancel other orders on the instrument
* `a` (amount) => amount to buy or sell
* `p` (price)  => price to execute the order (only used for limit and stop orders)

