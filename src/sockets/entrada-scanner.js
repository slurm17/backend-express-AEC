import { SERIAL } from "../config/constants.js";

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { activarRele } from "../services/relay.service.js";
import fetch from "node-fetch";

export function entradaScanner(socketIo) {
    const io = socketIo;
    const port = new SerialPort({
        path: SERIAL.ENTRADA,
        baudRate: SERIAL.BAUD_RATE,
    });
    const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    port.on("open", () => {
        console.log("Puerto serie ENTRADA abierto en " + SERIAL.ENTRADA);
    });
    parser.on("data", async (data) => {
        const dniLeido = data.trim();
        console.log("DNI leído ENTRADA:", dniLeido);
        // socketIo.emit("entrada-socio-leido", { dni: dniLeido });
        let estado = "";
        let socio = null;
        // try {
        //     const response = await fetch(`http://localhost:3000/socios/dni/${dniLeido}`);
        //     if (!response.ok) {
        //         throw new Error(`Error en la petición: ${response.status}`);
        //     }
        //     const { data } = await response.json();
        //     console.log({ data });
        //     socio = data;
        //     if (socio) {
        //         if (socio.estado_socio === 2) {
        //             estado = "ACCESO PERMITIDO ✅";
        //             activarRele(0); // Activar relé de ENTRADA
        //         }
        //         else {
        //             estado = "ACCESO DENEGADO - CUOTA ATRASADA ❌";
        //         }
        //     }
        //     else {
        //         estado = "SOCIO INVÁLIDO ⚠️";
        //     }
        // }
        // catch (err) {
        //     console.error("Error:", err);
        //     estado = "ERROR AL CONSULTAR SOCIO ❌";
        // }
        io.emit("scanner-entrada", {
            dni: dniLeido,
            socio,
            estado,
        });
    });
    port.on("error", (err) => {
        console.error("Error en el puerto serie ENTRADA: ", err.message);
    });
    return port;
}