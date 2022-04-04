'use strict';
require('console-stamp')(console, { 
    format: ':date(yyyy/mm/dd HH:MM:ss.l)' 
} );
console.log("-- Starting server...");

let config = require('./config.json');

const ccxt = require ('ccxt');
const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json()) 

// Generates all necessary exchange clients
console.log("-- Initializing exchanges:")
config.exchanges.forEach(function(e){
	console.log("   -", e.exchange, "("+e.name+")")
	global[e.name] = new ccxt[e.exchange] ({
		apiKey: e.key,
		secret: e.secret
	})
});

app.get('/', function (req, res) {
	res.send("Nothing to see here...")
})

app.get('/exchanges', function (req, res) {
	(async function () {
		res.send(ccxt.exchanges)
	}) ();
})

app.get('/markets', function (req, res) {
	let exchange = req.query.exchange
	if (!exchange) {
		res.send("Please provide an 'exchange' value.")
	} else {
		(async function () {
			let name = getNameByExchange(exchange)
			res.send(await eval(name).loadMarkets())
		}) ();
	}
})

function getNameByExchange(exchange) {
	return config.exchanges.find(e => e.exchange === exchange).name
}

function getExchangeByName(name) {
	return config.exchanges.find(e => e.name === name).exchange
}

function getExchangeParams(name) {
	let exchange = config.exchanges.find(e => e.name === name)
	let params = exchange.params || {}
	return params
}

async function getCurrentPosition(name, instrument) {
	let balance = await eval(name).fetchPosition(instrument)
	console.log("<- getCurrentPosition", [balance.info.direction, balance.info.size])
	return [balance.info.direction, balance.info.size]
}

function getClosingOrder(order) {
	let side = order[0] === "buy" ? "sell" : "buy"
	console.log("<- getClosingOrder", [side, order[1]])
	return [side, order[1]]
}

async function getBalance(exchange) {
	console.log("-> getBalance", exchange)
	let e = eval(exchange)
	let p = getExchangeParams(exchange)
	let balance = await e.fetchBalance(p)
	console.log("<- getBalance", balance)
}

async function processOrder(account, instrument, order) {
	console.log("-> Processing", order)
	switch (order.t) {
	  case 'limit_buy':
		eval(account).createOrder(instrument, "limit", "buy", order.a, order.p)
		break;
	  case 'limit_sell':
		eval(account).createOrder(instrument, "limit", "sell", order.a, order.p)
		break;
	  case 'market_buy':
		eval(account).createOrder(instrument, "market", "buy", order.a)
		break;
	  case 'market_sell':
		eval(account).createOrder(instrument, "market", "sell", order.a)
		break;
	  case 'stop_market_buy':
		eval(account).createOrder(instrument, "stop_market", "buy", order.a, null, { "trigger_price": order.p, "trigger": "mark_price", "reduce_only": true })
		break;
	  case 'stop_market_sell':
		eval(account).createOrder(instrument, "stop_market", "sell", order.a, null, { "trigger_price": order.p, "trigger": "mark_price", "reduce_only": true })
		break;
	  case 'close_position':
		let position = await getCurrentPosition(account, instrument);
		let closing_order = getClosingOrder(position)
		eval(account).createOrder(instrument, "market", closing_order[0], closing_order[1])
	  	eval(account).cancelAllOrders(instrument)
		console.log("-> Set closing_order", closing_order, "and canceled pending orders.")
		break;
	  default:
	    console.error("xx Unknown order type, please refer to the documentation.", order.t);
	}
	console.log("<- Executed order", order)
	console.log("--")
}

app.post('/trade', function (req, res) {
    console.log("<- Received", req.body.orders.length, "order(s) for", req.body.account, ":", req.body.instrument)
    req.body.orders.forEach(order => processOrder(req.body.account, req.body.instrument, order));
    res.end();
})

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("** Server listening on port", PORT);
});

