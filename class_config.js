class Config {
	constructor(json) {
		this.exchanges = json.exchanges;
	}

	getAccountByExchange(exchange) {
		return this.exchanges.find(e => e.exchange === exchange).account
	}

	getExchangeByAccount(account) {
		return this.exchanges.find(e => e.account === account).exchange
	}

	getAccountParams(account) {
		let exchange = this.exchanges.find(e => e.account === account)
		let params = exchange.hasOwnProperty('params') ? exchange.params : {}
		return params
	}
}

module.exports = Config