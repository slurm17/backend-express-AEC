import { SERIAL } from "../config/constants.js";

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { activarRele } from "../services/relay.service.js";
import fetch from "node-fetch";

export function salidaScanner(socketIo) {
    const io = socketIo;
    const port = new SerialPort({
        path: SERIAL.SALIDA,
        baudRate: SERIAL.BAUD_RATE,
    });
    const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    port.on("open", () => {
        console.log("Puerto serie SALIDA abierto en " + SERIAL.SALIDA);
    });
    parser.on("data", async (data) => {
        const dniLeido = data.trim();
        console.log("DNI leído SALIDA:", dniLeido);
        let estado = "";
        let socio = null;
        io.emit("scanner-salida", {
            dni: dniLeido,
            socio,
            estado,
        });
    });
    port.on("error", (err) => {
        console.error("Error en el puerto serie SALIDA: ", err.message);
    });
    return port;
}