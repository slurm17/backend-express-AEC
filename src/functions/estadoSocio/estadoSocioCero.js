import { activarRele } from "../../services/relay.service.js";
import { resetIngresoRestante } from "../../services/socios.service.js";

export const estadoSocioCero = async ({dni, io, socio}) => {
    await resetIngresoRestante(dni, 3);
    io.emit("scanner-entrada", {
        mensaje: "ACCESO PERMITIDO ✅",
        dni,
        socio,
    });
    activarRele(0); // Activar relé de ENTRADA
}