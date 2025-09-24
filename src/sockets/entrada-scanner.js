import { SERIAL } from "../config/constants.js";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { activarRele } from "../services/relay.service.js";
import { createSocio, findSocioByDni, getSociosAccess, updateSocio } from "../services/socios.service.js";
import { estadoSocioCero } from "../functions/estadoSocio/estadoSocioCero.js";
import { estadoSocioDos } from "../functions/estadoSocio/estadoSocioDos.js";
import { estadoSocioCinco } from "../functions/estadoSocio/estadoSocioCinco.js";
import { findCodigoQrByCodigo } from "../services/qr.service.js";
import { getConfiguracion } from "../services/configuracion.service.js";
import { emitAndRegister } from "../functions/socket/emitAndRegister.js";
import moment from "moment-timezone";

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
            emitAndRegister({
                io, 
                mensaje: "⛔️ ERROR AL LEER EL CODIGO", 
                codigo_qr: dniLeido,
                qr: true,
                error : true
            });
        }
        // Si tiene mas de 9 digitos es codigo qr sino es dni de la tarjeta de socio
        else if (dniLeido.length > 9) {
            console.log("DNI leido ENTRADA:", dniLeido);
            const codigoQrLeido = dniLeido;
            const dataCodigoQr = await findCodigoQrByCodigo(codigoQrLeido);
            // console.log("🚀 ~ entradaScanner ~ dataCodigoQr:", dataCodigoQr)
            if (!dataCodigoQr) {
                emitAndRegister({
                    io, 
                    mensaje: "⛔️ CODIGO QR NO ENCONTRADO", 
                    codigo_qr: codigoQrLeido,
                    qr: true,
                    error : true
                });
            }else{
                //Corregir fecha 
                const fechaExp = moment.tz(dataCodigoQr.fecha_venc, "America/Argentina/Buenos_Aires");
                const ahora = moment.tz("America/Argentina/Buenos_Aires");
                if (ahora.isAfter(fechaExp)) {
                // if (ahora > fechaExp) {
                    emitAndRegister({
                        io, 
                        mensaje: "⛔️ CODIGO QR VENCIDO", 
                        codigo_qr: codigoQrLeido,
                        qr: true,
                        tipoPase : dataCodigoQr.tipo,
                        dni: dataCodigoQr.documento,
                        error : true
                    });
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
                            ingreso_restante: config?.pase_permitidos, 
                        }).then((nuevoSocio) => {
                            socioLocalDbQr = nuevoSocio;
                        });
                    }else{
                        socioLocalDbQr = socioDbQR;
                        await updateSocio({
                            dni: parseInt(dataCodigoQr.documento, 10), // dniLeido,
                            nuevoEstado: parseInt(dataSocioQrAccess.estado_socio, 10),
                            nuevaFecha: dataSocioQrAccess.fecha_estado
                        })
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
                            // data : { dataCodigoQr },
                            mensaje: "⛔️ ERROR - NO COINCIDE ESTADO SOCIO", 
                            codigo_qr: dniLeido,
                            qr: true,
                            tipoPase : dataCodigoQr.tipo,
                            dni: dataCodigoQr.documento,
                            error : true
                        });
                    }
                } else if (dataCodigoQr.tipo === "invitado" || dataCodigoQr.tipo === "mantenimiento" || dataCodigoQr.tipo === "diario") {
                    emitAndRegister({
                        io, 
                        mensaje: "✅ ACCESO PERMITIDO", 
                        codigo_qr: dniLeido,
                        qr: true,
                        tipoPase : dataCodigoQr.tipo,
                        dni: dataCodigoQr.documento,
                    });
                    activarRele(0); // Activar relé de ENTRADA
                } else {
                    emitAndRegister({
                        io, 
                        mensaje: "⛔️ ERROR - NO COINCIDE TIPO QR", 
                        codigo_qr: dniLeido,
                        qr: true,
                        tipoPase : dataCodigoQr.tipo,
                        dni: dataCodigoQr.documento,
                        error : true
                    });
                }
            }
            // console.log("🚀 ~ entradaScanner ~ dataCodigoQr:", dataCodigoQr)
            // const dataCodigoQr = parseCodigoQR(dniLeido);
            return
        } else {
            let socioLocalDb = null;
            try {
                // Consultar API externa 
                console.log("🚀 ~ entradaScanner ~ dniLeido:", dniLeido)
                const dataSocio = await getSociosAccess(dniLeido);
                if (!dataSocio) {
                    emitAndRegister({
                        io,
                        mensaje: "⛔️ SOCIO NO ENCONTRADO", 
                        dni: dniLeido,
                        error : true
                    });
                } else {
                    // Buscar en la base de datos local  
                    const socioDb = await findSocioByDni(dniLeido);
                    // Si no existe, crearlo
                    if (!socioDb) {
                        const config = await getConfiguracion();
                        await createSocio({
                            documento: dniLeido,
                            nom_y_ap: dataSocio.nombre,
                            estado: parseInt(dataSocio.estado_socio, 10),
                            nro_socio: dataSocio.num_socio,
                            fecha_estado: dataSocio.fecha_estado,
                            // Corregir con config db
                            ingreso_restante: config?.pase_permitidos
                        }).then((nuevoSocio) => {
                            socioLocalDb = nuevoSocio;
                            console.log("Nuevo socio creado:", nuevoSocio);
                        });
                    }else {
                        socioLocalDb = socioDb;
                        await updateSocio({
                            dni: parseInt(dniLeido, 10), // dniLeido,
                            nuevoEstado: parseInt(dataSocio.estado_socio, 10),
                            nuevaFecha: dataSocio.fecha_estado
                        })
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
                emitAndRegister({
                    io, 
                    mensaje: "⛔️ ERROR AL CONSULTAR SOCIO", 
                    dni: dniLeido,
                    error : true
                });
            }
        }
    })
    port.on("error", (err) => {
        console.error("Error en el puerto serie ENTRADA: ", err.message);
    });
    return port;
}