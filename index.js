'use strict';
require('console-stamp')(console, { 
    format: ':date(yyyy/mm/dd HH:MM:ss.l)' 
} );
console.log("-- Starting server...");

const Order 	= require('./class_order.js')
const Config 	= require('./class_config.js')
const json 		= require('./config.json');
global.config	= new Config(json)

const ccxt = require ('ccxt');
const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json()) 

/**************************************************
 *
 * Exchanges instances
 *
 ***************************************************/

console.log("-- Initializing exchanges:")
config.exchanges.forEach(function(e){
	console.log("   -", e.exchange, "("+e.account+")")
	global[e.account] = new ccxt[e.exchange] ({
		apiKey: e.key,
		secret: e.secret
	})
});

/**************************************************
 *
 * Routes
 *
 ***************************************************/

app.get('/', function (req, res) {
	res.send("Nothing to see here...")
})

app.get('/exchanges', function (req, res) {
	(async function () {
		res.send(ccxt.exchanges)
	}) ();
})

app.get('/exchanges/:exchange?', function (req, res) {
	let exchange = req.params.exchange
	if (!exchange) {
		res.send("Please provide an 'exchange' value.")
	} else {
		(async function () {
			let name = config.getAccountByExchange(exchange)
			res.send(await eval(name).loadMarkets())
		}) ();
	}
})

app.get('/exchanges/:exchange?/:currency?', function (req, res) {
	let exchange = req.params.exchange
	let currency = req.params.currency
	if (!exchange || !currency) {
		res.send("Please provide an 'exchange' and 'currency' value.")
	} else {
		(async function () {
			let name = config.getAccountByExchange(exchange)
			try {
				res.send(await eval(name).publicGetGetInstruments({currency: currency}))
			} catch (e) {
				res.send(e)
				console.error(e)
			}

		}) ();
	}
})

app.post('/trade', function (req, res) {
    console.log("<- Received", req.body.orders.length, "order(s) for", req.body.account, ":", req.body.instrument)
    req.body.orders.forEach(order => new Order(req.body.account, req.body.instrument, order).process());
    res.end();
})

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("** Server listening on port", PORT);
});

