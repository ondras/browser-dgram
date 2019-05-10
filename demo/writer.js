import require from "./require.js";

let server = require("dgram").createSocket("udp4");

function send() {
	let msg = Math.random();

	let p = document.createElement("p");
	p.textContent = `Sending ${msg}`;
	document.body.appendChild(p);

    server.send(msg, 12345);
	setTimeout(send, 2000);
}

send();
