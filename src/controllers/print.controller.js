import { printTicket } from "../services/print.service.js";

// async function imprimirTicket(req, res) {
//   const { nombre, apellido, dni } = req.body;
//   try {
//     await printTicket({ nombre, apellido, dni });
//     res.send("Ticket enviado a imprimir");
//   } catch (err) {
//     console.error("Error al imprimir:", err);
//     res.status(500).send("Error al imprimir");
//   }
// }

// module.exports = { imprimirTicket };

export const imprimirTicket = async (req, res, next) => {
  try {
    const { nombre, apellido, dni, codigo, fechaEmision, fechaVencimiento, tipoDePase= "PASE QR" } = req.body;
    await printTicket({ nombre, apellido, dni, codigo, fechaEmision, fechaVencimiento, tipoDePase });
    res.json({ message: "Ticket enviado a imprimir" });
  } catch (error) {
    console.error("Error al imprimir:", error);
    res.status(500).json({ error: "Error al imprimir el ticket" });
    next(error);
  }
};
