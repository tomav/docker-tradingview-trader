class Config {
	constructor(json) {
		this.exchanges = json.exchanges;
	}

	getAccountByExchange(exchange_name) {
		let exchange =  this.exchanges.find(e => e.exchange === exchange_name)
		if (!exchange) {
			throw new Error(`No exchange named '${exchange}'`);
		}
		return exchange.account
	}

	getExchangeByAccount(account_name) {
		let account = this.exchanges.find(e => e.account === account_name)
		if (!account) {
			throw new Error(`No account named '${account}'`);
		}
		return account.exchange
	}

	getAccountParams(account) {
		let exchange = this.exchanges.find(e => e.account === account)
		let params = exchange.hasOwnProperty('params') ? exchange.params : {}
		return params
	}
}

module.exports = Config