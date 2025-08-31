import { Server } from "socket.io";

const initIo = (server) =>{
    const io = new Server(server, {
      cors: {
        origin: ["http://localhost:5173/", "http://localhost:5174/"], // puerto de tu frontend (Vite en este ejemplo)
        methods: ["GET", "POST"]
      }
    });
    server.listen(4000, () => {
      console.log("Servidor corriendo en http://localhost:4000");
    });
    return io
}

export  { initIo }