// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";
// import { SERIAL, MODBUS } from "../config/constants.js";
// import { socioValido } from "../utils/socio.mock.js";
// import { activarRele } from "./relay.service.js";
// import io from "../sockets/io.js"; // para emitir eventos

// export function initSerial() {
//   const port = new SerialPort({
//     path: SERIAL.ENTRADA,
//     baudRate: SERIAL.BAUD_RATE,
//   });

//   const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

//   parser.on("data", (data) => {
//     const dniLeido = data.trim();
//     console.log("DNI leído:", dniLeido);

//     let estado = "";
//     let socio = null;

//     if (dniLeido === socioValido.dni) {
//       socio = socioValido;
//       if (socio.cuentaAlDia) {
//         estado = "ACCESO PERMITIDO ✅";
//         activarRele(MODBUS.RELAY_COIL_ENTRADA);
//       } else {
//         estado = "ACCESO DENEGADO - CUOTA ATRASADA ❌";
//       }
//     } else {
//       estado = "SOCIO INVÁLIDO ⚠️";
//     }

//     io.emit("resultado-socio", { dni: dniLeido, socio, estado });
//   });
// }
