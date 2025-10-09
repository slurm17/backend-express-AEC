import { emitAndRegister } from "../../functions/socket/emitAndRegister.js";
import { getConfiguracion } from "../../services/configuracion.service.js";
import { activarRele } from "../../services/relay.service.js";
import { resetIngresoRestante } from "../../services/socios.service.js";

export const estadoSocioCero = async ({dni, io, socio}) => {
    
    // try catch por si la consulta falla
    const config = await getConfiguracion();
    await resetIngresoRestante(dni, config?.pase_permitidos);
    emitAndRegister({
        io, 
        mensaje: "¡BIENVENIDO AL CLUB!", 
        data : socio,
        tipoPase : "socio",
        dni: dni,
        estado : 0
    });
    // io.emit("scanner-entrada", {
    //     mensaje: "ACCESO PERMITIDO ✅",
    //     dni,
    //     socio,
    // });
    activarRele(0); // Activar relé de ENTRADA
}