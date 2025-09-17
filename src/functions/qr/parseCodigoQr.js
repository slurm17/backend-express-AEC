
// export function parseCodigoQR(codigo) {
//   // Dividimos el código por guiones
//   const partes = codigo.split("-");

//   if (partes.length < 4) {
//     throw new Error("Código QR inválido");
//   }

//   // Determinamos el tipo de pase
//   const tipoMap = {
//     PASE: "diario",
//     SOCIO: "socio",
//     INV: "invitado",
//     MAN: "mantenimiento"
//   };

//   const tipoPase = tipoMap[partes[0]];
//   if (!tipoPase) {throw new Error("Tipo de pase desconocido");}

//   const dni = partes[1];

//   // Función para convertir "ddmmyyyy_hhmm" a Date
//   const parseFecha = (str) => {
//     const [fecha, hora] = str.split("_");
//     const dd = parseInt(fecha.slice(0, 2), 10);
//     const mm = parseInt(fecha.slice(2, 4), 10) - 1; // meses 0-11
//     const yyyy = parseInt(fecha.slice(4, 8), 10);
//     const hh = parseInt(hora.slice(0, 2), 10);
//     const min = parseInt(hora.slice(2, 4), 10);
//     return new Date(yyyy, mm, dd, hh, min);
//   };

//   const fechaActual = parseFecha(partes[2]);
//   const fechaVencimiento = parseFecha(partes[3]);

//   // Para invitado, hay un id extra
//   const id = tipoPase === "invitado" ? partes[4] : undefined;

//   return {
//     tipoPase,
//     dni,
//     fechaActual,
//     fechaVencimiento,
//     id
//   };
// }

// // Ejemplo de uso
// // const codigoQR = 'INV-12345678-03092025_1815-03092025_2015-INV001';
// // const datos = parseCodigoQR(codigoQR);

// // console.log(datos);
