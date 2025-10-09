import { emitAndRegister } from "../../functions/socket/emitAndRegister.js";
import { activarRele } from "../../services/relay.service.js";

export const estadoSocioCinco = async ({dniLeido, io, dataSocio}) => {
    // CONTROLAR FECHAS
    console.log("🚀 ~ estadoSocioCinco ~ dataSocio:", dataSocio)
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
        emitAndRegister({
            io, 
            mensaje: "ACCESO PERMITIDO ✅", 
            data : dataSocio,
            tipoPase : "socio",
            dni: dniLeido,
            estado : 5
        });
        activarRele(0); // Activar relé de ENTRADA
    } else {
        emitAndRegister({
            io, 
            mensaje: "ACCESO DENEGADO - SOCIO TEMPORAL VENCIDO ❌", 
            data : dataSocio,
            tipoPase : "socio",
            dni: dniLeido,
            estado : 5,
            error : true
        });
    }
}