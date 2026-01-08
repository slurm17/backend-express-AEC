import { printTicket } from "../services/print.service.js";


export const imprimirTicket = async (req, res, next) => {
  try {
    const { 
      nombre, 
      apellido, 
      dni, 
      codigo, 
      fechaEmision, 
      fechaVencimiento, 
      tipoDePase= "PASE QR", 
      ip, 
      puerto 
    } = req.body;
    if (!ip || !puerto) {
      return res.status(400).json({ error: "Faltan los parámetros 'ip' o 'puerto'" });
    }
    await printTicket({ nombre, apellido, dni, codigo, fechaEmision, fechaVencimiento, tipoDePase, ip, puerto });
    res.json({ message: "Ticket enviado a imprimir" });
  } catch (error) {
    console.error("Error al imprimir:", error);
    res.status(500).json({ error: "Error al imprimir el ticket" });
    next(error);
  }
};
