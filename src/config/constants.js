export const WEB_PORT = 3000;

export const SERIAL = {
  ENTRADA: process.env.SERIAL_ENTRADA,
  SALIDA: process.env.SERIAL_SALIDA,
  BAUD_RATE: 115200,
};

export const MODBUS = {
  RELAY_IP: process.env.MODBUS_RELAY_IP,
  RELAY_PORT: 502,
  RELAY_ID: 1,
  RELAY_COIL_ENTRADA: 0,
  RELAY_COIL_SALIDA: 1,
};

// VERIFICAR VARIABLE
// export const PRINTER = {
//   IP: "192.168.0.53",
//   PORT: 9100,
// };
