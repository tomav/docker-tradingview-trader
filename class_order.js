class Order {
	constructor(account, instrument, order) {
		this.account = account;
		this.instrument = instrument;
		this.order = order;
	}

	async getCurrentPosition() {
		let position = await eval(this.account).fetchPosition(this.instrument)
		console.debug("<- getCurrentPosition", [position.info.direction, Math.abs(position.info.size)])
		return [position.info.direction, Math.abs(position.info.size)]
	}

	getClosingOrder(current_direction_and_amount) {
		let side = current_direction_and_amount[0] === "buy" ? "sell" : "buy"
		console.debug("<- getClosingOrder", [side, current_direction_and_amount[1]])
		return [side, current_direction_and_amount[1]]
	}

	getScaledOrderPrices() {
		var [f,t] = [Math.min(this.order.u, this.order.l), Math.max(this.order.u, this.order.l)]
		let step = Math.abs(f-t)/this.order.n
		let prices = [f.toFixed(2)]
		while (Math.max(...prices) <= t-step) {
			let val = Math.max(...prices)+step
			prices.push(val.toFixed(2))
		}
		return prices
	}

	async process() {
		console.log("-> Processing", this.order)
		switch (this.order.t) {
			case 'limit_buy':
				eval(this.account).createOrder(this.instrument, "limit", "buy", this.order.a, this.order.p)
				return "executed limit_buy"
			case 'limit_sell':
				eval(this.account).createOrder(this.instrument, "limit", "sell", this.order.a, this.order.p)
				return "executed limit_sell"
			case 'scaled_buy':
				var prices = this.getScaledOrderPrices();
				var amount = this.order.a/this.order.n
				prices.forEach(price => eval(this.account).createOrder(this.instrument, "limit", "buy", amount, price));
				return "executed scaled_buy"
			case 'scaled_sell':
				var prices = this.getScaledOrderPrices();
				var amount = this.order.a/this.order.num
				prices.forEach(price => eval(this.account).createOrder(this.instrument, "limit", "sell", amount, price));
				return "executed scaled_sell"
			case 'market_buy':
				eval(this.account).createOrder(this.instrument, "market", "buy", this.order.a)
				return "executed market_buy"
			case 'market_sell':
				eval(this.account).createOrder(this.instrument, "market", "sell", this.order.a)
				return "executed market_sell"
			case 'stop_market_buy':
				eval(this.account).createOrder(this.instrument, "stop_market", "buy", this.order.a, null, { "trigger_price": this.order.p, "trigger": "mark_price", "reduce_only": true })
				return "executed stop_market_buy"
			case 'stop_market_sell':
				eval(this.account).createOrder(this.instrument, "stop_market", "sell", this.order.a, null, { "trigger_price": this.order.p, "trigger": "mark_price", "reduce_only": true })
				return "executed stop_market_sell"
			case 'close_position':
				let position = await this.getCurrentPosition(this.account, this.instrument);
				if ( ["buy", "sell"].includes(position[0]) ) {
					let closing_order = this.getClosingOrder(position)
					eval(this.account).createOrder(this.instrument, "market", closing_order[0], closing_order[1])
				  	eval(this.account).cancelAllOrders(this.instrument)
					console.debug("-> Set closing_order", closing_order, "and canceled pending orders.")
					return "executed close_position"
				} else {
					return "No position, nothing to close."
				}
			default:
				console.error("xx Unknown order type, please refer to the documentation.", this.order.t);
				return "Error: Unknown type " + this.order.t
		}
	}
}

module.exports = Order
