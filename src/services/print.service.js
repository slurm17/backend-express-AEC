import path from "path";
import escpos from "escpos";
import sharp from "sharp";
import fs from "fs/promises";
import escposNetwork from "escpos-network";
// const fs = require("fs").promises;
import moment from "moment";
import { fileURLToPath } from "url";

escpos.Network = escposNetwork;
// escpos.Network = require("escpos-network");

const PRINTER_IP = "192.168.0.53";
const PRINTER_PORT = 9100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Carga imagen para escpos.
 * Si resizeWidth está definido, redimensiona la imagen al ancho indicado antes de cargar.
 * Usa archivo temporal para compatibilidad.
 * @param {string} imagePath - Ruta de la imagen
 * @param {number} [resizeWidth] - Ancho para redimensionar (opcional)
 * @returns {Promise<escpos.Image>}
 */

async function loadImageToEscposImage(imagePath, resizeWidth) {
  if (!resizeWidth) {
    // Carga directa igual que antes
    return new Promise((resolve, reject) => {
      escpos.Image.load(imagePath, (image) => {
        if (!image) {return reject(new Error("No se pudo cargar la imagen"));}
        resolve(image);
      });
    });
  } else {
    // Redimensionar a resizeWidth y guardar temporalmente
    const tempPath = path.join(__dirname, "temp-resized.png");
    try {
      await sharp(imagePath).resize(resizeWidth).png().toFile(tempPath);

      const image = await new Promise((resolve, reject) => {
        escpos.Image.load(tempPath, (img) => {
          if (!img) {return reject(new Error("No se pudo cargar la imagen redimensionada"));}
          resolve(img);
        });
      });
      await fs.unlink(tempPath); // borrar temp
      return image;
    } catch (error) {
      // Intentar borrar archivo temp si existe
      try { await fs.unlink(tempPath); } catch (e) {console.warn("No se pudo borrar temp:", e);}
      throw error;
    }
  }
}

// Pasar como param fech emision y venc en formato isoString "YYYY-MM-DDTHH:mm:ssZ"
export async function printTicket({ 
    nombre, 
    apellido = "", 
    dni, 
    codigo, 
    fechaEmision : fechaHora, 
    fechaVencimiento: vencimiento 
  }) {
  const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
  const printer = new escpos.Printer(device);

  try {
    await new Promise((resolve, reject) => device.open(err => (err ? reject(err) : resolve())));
    console.log("Conectado a la impresora.");

    // Redimensiono logoClub a ancho 150px, logoNetter sin redimensionar
    const logoClub = await loadImageToEscposImage(path.join(__dirname, "../../public/img/logo-club.png"), 250);
    const logoNetter = await loadImageToEscposImage(path.join(__dirname, "../../public/img/logo-netter.png"),205);
    // const fechaHora = moment().format("DD/MM/YYYY HH:mm");
    // const vencimiento = moment().add(1, "days").hour(8).minute(0).format("DD/MM/YYYY HH:mm");
    //printer.encode("UTF-8");
    printer.encode("CP858");
    printer.align("ct");
    printer.style("b");
    printer.size(1, 1);
    printer.text("ATLÉTICO ECHAGÜE CLUB");
    printer.image(logoClub, "d24");
    printer.text(""); // salto de línea
    
    //DEFINIR TIPO DE PASE VARIABLE

    printer.text("PASE DIARIO");
    printer.text(""); // salto de línea

    printer.style("normal");
    printer.size(0, 0);
    printer.text(`Nombre: ${nombre}`);
    {apellido && printer.text(`Apellido: ${apellido}`);}
    printer.text(`DNI: ${dni}`);
    printer.text(`Emitido: ${fechaHora}`);
    printer.text(`Vence: ${vencimiento}`);
    printer.text(""); // salto de línea

    await new Promise((resolve, reject) => {
      printer.qrimage(`${codigo}`, { type: "png", mode: "dhdw" }, (err) => {
      // printer.qrimage(`PASE-${dni}-${Date.now()}`, { type: "png", mode: "dhdw" }, (err) => {
        if (err) {return reject(err);}
        resolve();
      });
    });

    printer.text(""); // salto de línea
    printer.text("Desarrollado por:");
    printer.text("");
    printer.image(logoNetter, "d24");
    printer.text("www.netter.com.ar"); // salto de línea
    printer.text("");
    printer.text("¡Gracias por su visita!");
    printer.text("");
    printer.text("");
    printer.cut();

    await new Promise((resolve, reject) => printer.flush(err => (err ? reject(err) : resolve())));
    await new Promise((resolve, reject) => device.close(err => (err ? reject(err) : resolve())));
    console.log("Ticket impreso correctamente.");
  } catch (error) {
    console.error("Error imprimiendo ticket:", error);
  }
}

/*if (require.main === module) {
  printTicket({
    nombre: "Juan",
    apellido: "Pérez",
    dni: "12345678"
  });
}*/

// module.exports = { printTicket };
