import { activarRele } from "../../services/relay.service.js";
import { resetIngresoRestante } from "../../services/socios.service.js";

export const  estadoSocioDos = async ({dniLeido, io, socioLocalDb, dataSocio}) => {
    if (socioLocalDb.ingreso_restante > 0) {
        await resetIngresoRestante(dniLeido, socioLocalDb.ingreso_restante - 1);
        io.emit("scanner-entrada", {
            mensaje: `ACCESO PERMITIDO - CUOTA ATRASADA ❌ - ${socioLocalDb.ingreso_restante - 1} INGRESOS RESTANTES`,
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
}