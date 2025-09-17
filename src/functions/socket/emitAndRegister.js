import { createEvento } from "../../services/reg-evento.service.js";

export const emitAndRegister = ({
    io, mensaje="", data = {}, tipoPase = "", qr = false, codigo_qr = null, dni = "", estado = null,
}) => {
    io.emit("scanner-entrada", {
        mensaje,
        datos_socio: {
            nombre: data?.nombre || null,
            num_socio: data?.num_socio || null,
            dni
        }
    });
    createEvento({
        tipo: "E",
        tipo_pase: tipoPase,
        qr,
        codigo_qr,
        dni,
        estado,
        mensaje,
    })
};