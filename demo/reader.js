import require from "./require.js";

let listener = require("dgram").createSocket("udp4");

listener.on("message", (msg, rinfo) => {
	let p = document.createElement("p");
	p.textContent = `Got message ${msg}`;
	document.body.appendChild(p);
});

listener.on("listening", () => {
    const address = listener.address();
	let p = document.createElement("p");
	p.textContent = `UDP Listening: ${address.address}:${address.port}`;
	document.body.appendChild(p);
})

listener.bind(12345);
