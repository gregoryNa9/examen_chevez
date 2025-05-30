module.exports = (httpServer) => {
    const { Server } = require('socket.io');
    const io = new Server(httpServer);

    // Objeto para usuarios con estado y sockets
    const users = {};

    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado:", socket.id);

        socket.on("new-user", (username) => {
            socket.username = username;
            if (!users[username]) {
                users[username] = { connected: true, sockets: new Set() };
            }
            users[username].connected = true;
            users[username].sockets.add(socket.id);

            // Emitir lista con usuarios y estados
            io.emit("user-list", Object.entries(users).map(([user, info]) => ({
                user,
                connected: info.connected
            })));

            console.log("Usuario conectado:", username);
        });

        socket.on("message", (data) => {
            io.emit("message", {
                user: data.user,
                message: data.message,
            });
        });

        socket.on("disconnect", () => {
            const username = socket.username;
            if (username && users[username]) {
                users[username].sockets.delete(socket.id);
                if (users[username].sockets.size === 0) {
                    users[username].connected = false;
                }

                io.emit("user-list", Object.entries(users).map(([user, info]) => ({
                    user,
                    connected: info.connected
                })));

                console.log("Usuario desconectado:", username);
            }
        });
    });
};
