import { SERIAL } from "../config/constants.js";

import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { activarRele } from "../services/relay.service.js";
import { createSocio, findSocioByDni, getSociosAccess, resetIngresoRestante } from "../services/socios.service.js";

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
                    await resetIngresoRestante(dniLeido, 3);
                    io.emit("scanner-entrada", {
                        mensaje: "ACCESO PERMITIDO ✅",
                        dni: dniLeido,
                        socio : dataSocio,
                    });
                    activarRele(0); // Activar relé de ENTRADA
                    return;
                }
                if (dataSocio?.estado_socio === "2") {
                    if (socioLocalDb.ingreso_restante > 0) {
                        await resetIngresoRestante(dniLeido, socioLocalDb.ingreso_restante - 1);
                        io.emit("scanner-entrada", {
                            mensaje: `ACCESO PERMITIDO - CUOTA ATRASADA ❌ - ${socioLocalDb.ingreso_restante} INGRESOS RESTANTES`,
                            dni: dniLeido,
                            socio: dataSocio,
                        });
                        activarRele(0); // Activar relé de ENTRADA
                    } else {
                        io.emit("scanner-entrada", {
                            mensaje: "ACCESO DENEGADO - CUOTA ATRASADA ❌",
                            dni: dniLeido,
                            socio: dataSocio,
                        });
                    }
                    return;
                }
                if (dataSocio?.estado_socio === "5") {
                    const fechaEstado = new Date(dataSocio.fecha_estado);
                    // Obtener mes y año de fecha_estado
                    const mesEstado = fechaEstado.getMonth() + 1; // getMonth() va de 0 a 11
                    const anioEstado = fechaEstado.getFullYear();
                    // Obtener mes y año actual
                    const fechaActual = new Date();
                    const mesActual = fechaActual.getMonth() + 1;
                    const anioActual = fechaActual.getFullYear();
                    // Comparar
                    if (mesEstado === mesActual && anioEstado === anioActual) {
                        io.emit("scanner-entrada", {
                            mensaje: "ACCESO PERMITIDO ✅",
                            dni: dniLeido,
                            socio: dataSocio,
                        });
                        activarRele(0); // Activar relé de ENTRADA
                        console.log("Coinciden mes y año ✅");
                    } else {
                        io.emit("scanner-entrada", {
                            mensaje: "ACCESO DENEGADO - SOCIO TEMPORARIO VENCIDO ❌",
                            dni: dniLeido,
                            socio: dataSocio,
                        });
                        console.log("No coinciden ❌");
                    }
                    return;
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