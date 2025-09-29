import { SERIAL } from "../config/constants.js";

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
// import { activarRele } from "../services/relay.service.js";
import fetch from "node-fetch";
import { createEvento } from "../services/reg-evento.service.js";
import { findCodigoQrByCodigo } from "../services/qr.service.js";
import { getSociosAccess } from "../services/socios.service.js";
import { activarReleSalida } from "../services/relay-salida.service.js";

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
        const codigoLeido = data.trim();
        console.log("codigo/dni leído SALIDA:", codigoLeido);
        if (codigoLeido.length > 9) {
            const dataCodigoQr = await findCodigoQrByCodigo(codigoLeido);
            console.log("🚀 ~ salidaScanner ~ dataCodigoQr:", dataCodigoQr)
            if(!dataCodigoQr){
                const mensaje = "ERROR AL LEER EL CODIGO QR";
                // io.emit("scanner-salida", {
                //     mensaje,
                //     dni: codigoLeido,
                //     socio : null,
                // });
                createEvento({
                    tipo: "S",
                    tipo_pase: "",
                    qr: false,
                    codigo_qr: null,
                    dni: codigoLeido,
                    estado: null,
                    mensaje,
                })
            } else {
                activarReleSalida(1); // Activar relé de SALIDA
                createEvento({
                    tipo: "S",
                    tipo_pase: dataCodigoQr?.tipo,
                    qr: true,
                    codigo_qr: dataCodigoQr?.codigo,
                    dni : dataCodigoQr?.documento,
                    estado: null,
                    // mensaje,
                })
            }
    } else {
        const dataSocioDni = await getSociosAccess(codigoLeido);
        if (!dataSocioDni) {
            const mensaje = "SOCIO NO ENCONTRADO";
            // io.emit("scanner-salida", {
            //     mensaje,
            //     dni: codigoLeido,
            //     socio : null,
            // });
            createEvento({
                tipo: "S",
                tipo_pase: "",
                qr: false,
                codigo_qr: null,
                dni: codigoLeido,
                estado: null,
                mensaje,
            })
        } else {
            activarReleSalida(1); // Activar relé de SALIDA
            createEvento({
                tipo: "S",
                tipo_pase: "socio",
                qr: false,
                codigo_qr: null,
                dni : codigoLeido,
                estado: null,
                // mensaje,
            })
        }
        
    }

        // let estado = "";
        // let socio = null;
        // // io.emit("scanner-salida", {
        // //     dni: dniLeido,
        // //     socio,
        // //     estado,
        // // });
        // createEvento({
        //     tipo: "S",
        //     tipo_pase: tipoPase,
        //     qr,
        //     codigo_qr,
        //     dni,
        //     estado,
        //     mensaje,
        // })
    });
    port.on("error", (err) => {
        console.error("Error en el puerto serie SALIDA: ", err.message);
    });
    return port;
}