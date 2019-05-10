const PORT_MESSAGE = "__port";

let PORTS = {
	rx: {},
	tx: {}
};

let sockets = [];

class Socket {
	constructor() {
		this._boundPort = null;
		this._listening = false;

		this._listeners = [];
		sockets.push(this);
	}

	send(data, port) {
		let p = PORTS.tx[port];
		p && p.postMessage(data);
	}

	close() {
		this._stopListening();
		this._boundPort = null;
		let index = sockets.indexOf(this);
		sockets.splice(index, 1);
	}

	bind(port, callback) {
		this._stopListening();

		if (typeof(port) == "object") { port = port.port; }
		this._boundPort = port;

		callback && this.addListener("listening", callback);

		this.tryToListen();
	}

	address() {
		return {address:null, port:this._boundPort};
	}

	handleEvent(e) {
		this.emit("message", e.data);
	}

	tryToListen() {
		let port = PORTS.rx[this._boundPort];
		if (port && !this._listening) { this._startListening(); }
	}

	_startListening() {
		PORTS.rx[this._boundPort].addEventListener("message", this);
		this._listening = true;
		this.emit("listening");
	}

	_stopListening() {
		if (!this._listening) { return; }
		PORTS.rx[this._boundPort].removeEventListener("message", this);
		this._listening = false;
	}

	// EventEmitter basics

	addListener(type, listener) {
		if (!(type in this._listeners)) { this._listeners[type] = []; }
		this._listeners[type].push(listener);
	}

	removeListener(type, listener) {
		let listeners = this._listeners[type] || [];
		let index = listeners.indexOf(listener);
		if (index > -1) { listeners.splice(index, 1); }
	}

	emit(type, ...args) {
		let listeners = this._listeners[type] || [];
		listeners.forEach(l => l(...args));
	}

	on(...args) { return this.addListener(...args); }
	off(...args) { return this.removeListener(...args); }
}

function onMessage(e) {
	let data = e.data; // .what, .type, .number
	let what = data && data.what;
	if (what != PORT_MESSAGE) { return; }

	let port = e.ports[0];
	PORTS[data.type][data.number] = port;

	sockets.forEach(socket => socket.tryToListen());

	port.start();
}

window.addEventListener("message", onMessage);

export function createSocket() { return new Socket(); }

export function createConnection(number, contexts) {
	let what = PORT_MESSAGE;
	let channel = new MessageChannel();

	contexts.tx.postMessage({ what, number, type:"tx"}, "*", [channel.port1]);
	contexts.rx.postMessage({ what, number, type:"rx"}, "*", [channel.port2]);
}
