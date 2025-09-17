import { SERIAL } from "../config/constants.js";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { activarRele } from "../services/relay.service.js";
import { createSocio, findSocioByDni, getSociosAccess } from "../services/socios.service.js";
import { estadoSocioCero } from "../functions/estadoSocio/estadoSocioCero.js";
import { estadoSocioDos } from "../functions/estadoSocio/estadoSocioDos.js";
import { estadoSocioCinco } from "../functions/estadoSocio/estadoSocioCinco.js";
import { findCodigoQrByCodigo } from "../services/qr.service.js";
import { getConfiguracion } from "../services/configuracion.service.js";
import { emitAndRegister } from "../functions/socket/emitAndRegister.js";

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
        if (!dniLeido){
            // io.emit("scanner-entrada", {
            //     mensaje: "ERROR AL LEER EL CODIGO ❌",
            //     dni: dniLeido,
            //     socio : null,
            // });
            emitAndRegister({
                io, 
                data : {},
                mensaje: "ERROR AL LEER EL CODIGO ❌", 
                codigo_qr: dniLeido,
                qr: true,
            });
        }
        // Si tiene mas de 9 digitos es codigo qr sino es dni de la tarjeta de socio
        else if (dniLeido.length > 9) {
            console.log("DNI leido ENTRADA:", dniLeido);
            const codigoQrLeido = dniLeido;
            const dataCodigoQr = await findCodigoQrByCodigo(codigoQrLeido);
            if (!dataCodigoQr) {
                // io.emit("scanner-entrada", {
                //     mensaje: "CODIGO QR NO ENCONTRADO ❌",
                //     dni: dniLeido,
                //     socio : null,
                // });
                emitAndRegister({
                    io, 
                    data : {},
                    mensaje: "CODIGO QR NO ENCONTRADO ❌", 
                    codigo_qr: codigoQrLeido,
                    qr: true,
                });
            }else{
                console.log("🚀 ~ entradaScanner ~ dataCodigoQr:", dataCodigoQr)
                // const fechaExp = new Date(dataCodigoQr.fecha_expiracion.replace(" ", "T"));
                //Corregir fecha 
                const fechaExp = new Date(dataCodigoQr.fecha_expiracion);
                const ahora = new Date();
                if (ahora > fechaExp) {
                    emitAndRegister({
                        io, 
                        data : { dataCodigoQr },
                        mensaje: "CODIGO QR VENCIDO ❌", 
                        codigo_qr: codigoQrLeido,
                        qr: true,
                        tipoPase : dataCodigoQr.tipo,
                        dni: dataCodigoQr.documento,
                    });
                    // io.emit("scanner-entrada", {
                    //     mensaje: "CODIGO QR VENCIDO ❌",
                    //     dni: dniLeido,
                    //     socio : null,
                    // });
                    // console.log("CODIGO QR VENCIDO ❌");
                }
                else if(dataCodigoQr.tipo === "socio") {
                    let socioLocalDbQr = null;
                    const dataSocioQrAccess = await getSociosAccess(dataCodigoQr.documento);
                    // Buscar en la base de datos local
                    const socioDbQR = await findSocioByDni(dataCodigoQr.documento);
                    const config = await getConfiguracion();
                    if (!socioDbQR) {
                        await createSocio({
                            documento: dataCodigoQr.documento,
                            nom_y_ap: dataSocioQrAccess.nombre,
                            estado: parseInt(dataSocioQrAccess.estado_socio, 10),
                            nro_socio: dataSocioQrAccess.num_socio,
                            fecha_estado: dataSocioQrAccess.fecha_estado,
                            ingreso_restante: config?.ingreso_restante || 3, 
                        }).then((nuevoSocio) => {
                            socioLocalDbQr = nuevoSocio;
                        });
                    }else{
                        socioLocalDbQr = socioDbQR;
                    }
                    if (dataSocioQrAccess?.estado_socio === "0") {
                        await estadoSocioCero({ 
                            dni: dataCodigoQr.documento, 
                            io, 
                            socio: dataSocioQrAccess 
                        });
                    }
                    else if (dataSocioQrAccess?.estado_socio === "2") {
                        await estadoSocioDos({ 
                            dniLeido: dataCodigoQr.documento, 
                            io, 
                            socioLocalDb: socioLocalDbQr, 
                            dataSocio: dataSocioQrAccess 
                        });
                    }
                    else if (dataSocioQrAccess?.estado_socio === "5") {
                        await estadoSocioCinco({ 
                            dniLeido: dataCodigoQr.documento, 
                            io, 
                            dataSocio: dataSocioQrAccess 
                        });
                    } else {
                        emitAndRegister({
                            io, 
                            data : { dataCodigoQr },
                            mensaje: "ERROR - NO COINCIDE ESTADO SOCIO ❌", 
                            codigo_qr: dniLeido,
                            qr: true,
                            tipoPase : dataCodigoQr.tipo,
                            dni: dataCodigoQr.documento,
                        });
                        // io.emit("scanner-entrada", {
                        //     mensaje: "ERROR - NO COINCIDE ESTADO SOCIO ❌",
                        //     dni: dniLeido,
                        //     socio : null,
                        // });
                        console.log("ERROR - NO COINCIDE ESTADO SOCIO ❌");
                    }
                } else if (dataCodigoQr.tipo === "invitado" || dataCodigoQr.tipo === "mantenimiento" || dataCodigoQr.tipo === "diario") {
                    emitAndRegister({
                        io, 
                        data : { dataCodigoQr },
                        mensaje: "ACCESO PERMITIDO ✅", 
                        codigo_qr: dniLeido,
                        qr: true,
                        tipoPase : dataCodigoQr.tipo,
                        dni: dataCodigoQr.documento,
                    });
                    
                    // io.emit("scanner-entrada", {
                    //     mensaje: "ACCESO PERMITIDO ✅",
                    //     dni: dniLeido,
                    //     socio : null,
                    // });
                    activarRele(0); // Activar relé de ENTRADA
                } else {
                    emitAndRegister({
                        io, 
                        data : { dataCodigoQr },
                        mensaje: "ERROR - NO COINCIDE TIPO QR ❌", 
                        codigo_qr: dniLeido,
                        qr: true,
                        tipoPase : dataCodigoQr.tipo,
                        dni: dataCodigoQr.documento,
                    });
                    // io.emit("scanner-entrada", {
                    //     mensaje: "ERROR - NO COINCIDE TIPO QR ❌",
                    //     dni: dniLeido,
                    //     socio : null,
                    // });
                    console.log("ERROR - NO COINCIDE TIPO QR ❌");
                }
            }
            // console.log("🚀 ~ entradaScanner ~ dataCodigoQr:", dataCodigoQr)
            // const dataCodigoQr = parseCodigoQR(dniLeido);
            return
        } else {
            let socioLocalDb = null;
            io.emit("scanner-entrada", {
                mensaje: "ESPERE POR FAVOR... ⏳",
                dni: dniLeido,
                socio : null,
            });
            try {
                // Consultar API externa 
                const dataSocio = await getSociosAccess(dniLeido);
                if (!dataSocio) {
                    // io.emit("scanner-entrada", {
                    //     mensaje: "SOCIO NO ENCONTRADO ❌",
                    //     dni: dniLeido,
                    //     socio : null,
                    // });
                    emitAndRegister({
                        io, 
                        mensaje: "SOCIO NO ENCONTRADO ❌", 
                        data : { dni : dniLeido },
                        dni: dniLeido,
                    });
                    console.log("SOCIO NO ENCONTRADO ❌");
                } else {
                    // Buscar en la base de datos local  
                    const socioDb = await findSocioByDni(dniLeido);
                    // Si no existe, crearlo
                    if (!socioDb) {
                        await createSocio({
                            documento: dniLeido,
                            nom_y_ap: dataSocio.nombre,
                            estado: parseInt(dataSocio.estado_socio, 10),
                            nro_socio: dataSocio.num_socio,
                            fecha_estado: dataSocio.fecha_estado,
                            // Corregir con config db
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
        }
        
    })
    port.on("error", (err) => {
        console.error("Error en el puerto serie ENTRADA: ", err.message);
    });
    return port;
}