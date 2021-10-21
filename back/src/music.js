function music(io) {
	io.on("connection", (socket) => {
		// new Connection(io, socket);
		console.log("music")
	});
}

module.exports = music;
