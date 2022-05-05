class Order {
	constructor(account, instrument, order) {
		this.account = account
		this.instrument = instrument
		this.order = order
		this.params = global.config.getAccountParams(this.account)
		this.checkRequiredOrderParams()
	}

	checkRequiredOrderParams() {
		console.debug("-> checkRequiredOrderParams", this.order)
		const required = (name, val, type) => {
			if (val === undefined) {
				throw new Error(`Parameter '${name}' is required for ${type} orders`);
			}
		};
		switch (this.order.t) {
			case 'market_buy':
			case 'market_sell':
				required('a', this.order.a, this.order.t)
				break;
			case 'scaled_buy':
			case 'scaled_sell':
				required('a', this.order.a, this.order.t)
				required('u', this.order.u, this.order.t)
				required('l', this.order.l, this.order.t)
				required('n', this.order.n, this.order.t)
				break;
			case 'limit_buy':
			case 'limit_sell':
			case 'stop_market_buy':
			case 'stop_market_sell':
				required('a', this.order.a, this.order.t)
				required('p', this.order.p, this.order.t)
				break;
		}
	}

	async getCurrentPosition() {
		let position = await eval(this.account).fetchPosition(this.instrument)
		let response
		if (position.result.length > 0) {
			console.debug("<- getCurrentPosition", [position.result[0].direction, Math.abs(position.result[0].size)])
			response = [position.result[0].direction, Math.abs(position.result[0].size)]		
		} else {
			response = []
		}
		return response
	}

	async getContractSize() {
		let markets = await eval(this.account).publicGetGetInstruments(this.params)
	    let market = markets.result.find(market => market.instrument_name === this.instrument)
		console.debug("<- getContractSize", market.contract_size)
		return market.contract_size
	}

	async getPositionSize(stop_level, risk) {
		let balance 	    	= await eval(this.account).fetchBalance(this.params)
		let currency			= this.params.currency
		let capital_value     	= balance[currency].free
		let close 				= await eval(this.account).fetchTicker(this.instrument)
		let contract_size		= await this.getContractSize()
		let risk_amount        	= capital_value * risk 
		let stop_loss_distance 	= Math.abs(close-stop_level)
		let position_size      	= (risk_amount/(stop_loss_distance/close))/contract_size
		return position_size
	}

	getClosingOrder(current_direction_and_amount) {
		let side = current_direction_and_amount[0] === "buy" ? "sell" : "buy"
		console.debug("<- getClosingOrder", [side, current_direction_and_amount[1]])
		return [side, current_direction_and_amount[1]]
	}

	getScaledOrderPrices() {
		var [f,t] = [Math.min(this.order.u, this.order.l), Math.max(this.order.u, this.order.l)]
		let step = Math.abs(f-t)/(this.order.n-1)
		let prices = [f.toFixed(2)]
		while (Math.max(...prices) <= t-step) {
			let val = Math.max(...prices)+step
			prices.push(val.toFixed(2))
		}
		return prices
	}

	async process() {
		let amount
		if (this.order.t !== 'close_position') {
			amount = this.order.a.toString().includes("%") ? await this.getPositionSize(30, this.order.a) : this.order.a
		}
		console.log("-> Processing", this.order)
		switch (this.order.t) {
			case 'limit_buy':
				eval(this.account).createOrder(this.instrument, "limit", "buy", amount, this.order.p)
				return "executed limit_buy"
			case 'limit_sell':
				eval(this.account).createOrder(this.instrument, "limit", "sell", amount, this.order.p)
				return "executed limit_sell"
			case 'scaled_buy':
				var prices = this.getScaledOrderPrices();
				amount = amount/this.order.n
				prices.forEach(price => eval(this.account).createOrder(this.instrument, "limit", "buy", amount, price));
				return "executed scaled_buy"
			case 'scaled_sell':
				var prices = this.getScaledOrderPrices();
				amount = amount/this.order.num
				prices.forEach(price => eval(this.account).createOrder(this.instrument, "limit", "sell", amount, price));
				return "executed scaled_sell"
			case 'market_buy':
				eval(this.account).createOrder(this.instrument, "market", "buy", amount)
				return "executed market_buy"
			case 'market_sell':
				eval(this.account).createOrder(this.instrument, "market", "sell", amount)
				return "executed market_sell"
			case 'stop_market_buy':
				eval(this.account).createOrder(this.instrument, "stop_market", "buy", amount, null, { "trigger_price": this.order.p, "trigger": "mark_price", "reduce_only": true })
				return "executed stop_market_buy"
			case 'stop_market_sell':
				eval(this.account).createOrder(this.instrument, "stop_market", "sell", amount, null, { "trigger_price": this.order.p, "trigger": "mark_price", "reduce_only": true })
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
