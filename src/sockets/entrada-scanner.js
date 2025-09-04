import { SERIAL } from "../config/constants.js";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
// import { activarRele } from "../services/relay.service.js";
import { createSocio, findSocioByDni, getSociosAccess } from "../services/socios.service.js";
import { estadoSocioCero } from "../functions/estadoSocio/estadoSocioCero.js";
import { estadoSocioDos } from "../functions/estadoSocio/estadoSocioDos.js";
import { estadoSocioCinco } from "../functions/estadoSocio/estadoSocioCinco.js";

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
        console.log("🚀 ~ entradaScanner ~ dniLeido:", dniLeido);
        let socioLocalDb = null;
        console.log("DNI leído ENTRADA:", dniLeido);
        io.emit("scanner-entrada", {
            mensaje: "ESPERE POR FAVOR... ⏳",
            dni: dniLeido,
            socio : null,
        });
        try {
            // Consultar API externa 
            const dataSocio = await getSociosAccess(dniLeido);
            if (!dataSocio) {
                io.emit("scanner-entrada", {
                    mensaje: "SOCIO NO ENCONTRADO ❌",
                    dni: dniLeido,
                    socio : null,
                });
            } else {
                // Buscar en la base de datos local  
                const socioDb = await findSocioByDni(dniLeido);
                console.log("🚀 ~ entradaScanner ~ socioDb:", socioDb);
                // Si no existe, crearlo
                if (!socioDb) {
                    await createSocio({
                        documento: dniLeido,
                        nom_y_ap: dataSocio.nombre,
                        estado: parseInt(dataSocio.estado_socio, 10),
                        nro_socio: dataSocio.num_socio,
                        fecha_estado: dataSocio.fecha_estado,
                        ingreso_restante: 3, 
                    }).then((nuevoSocio) => {
                        socioLocalDb = nuevoSocio;
                        console.log("Nuevo socio creado:", nuevoSocio);
                    });
                }else {
                    socioLocalDb = socioDb;
                }
                if (dataSocio?.estado_socio === "0") {
                    await estadoSocioCero({ dni: dniLeido, io, socio: dataSocio });
                }
                if (dataSocio?.estado_socio === "2") {
                    await estadoSocioDos({ dniLeido, io, socioLocalDb, dataSocio });
                }
                if (dataSocio?.estado_socio === "5") {
                    await estadoSocioCinco({ dniLeido, io, dataSocio });
                }
            }
        }
        catch (err) {
            io.emit("scanner-entrada", {
                mensaje: "ERROR AL CONSULTAR SOCIO ❌",
                dni: dniLeido,
                socio : null,
            });
            console.error("Error:", err);
        }
    })
    port.on("error", (err) => {
        console.error("Error en el puerto serie ENTRADA: ", err.message);
    });
    return port;
}