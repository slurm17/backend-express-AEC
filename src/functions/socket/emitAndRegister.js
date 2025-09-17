import { createEvento } from "../../services/reg-evento.service.js";

export const emitAndRegister = ({
    io, mensaje, data = {}, tipoPase = "", qr = false, codigo_qr = null, dni = null, estado = null
}) => {
    io.emit("scanner-entrada", {
        mensaje,
        data
        // dni: dniLeido,
        // socio : null,
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