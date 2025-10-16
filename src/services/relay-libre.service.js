import { MODBUS } from "../config/constants.js";
// @ts-ignore
import ModbusRTU from "modbus-serial";

export const activarReleLibre = async (puerto) => {
  const client = new ModbusRTU();
  try {
    await client.connectTCP(MODBUS.RELAY_IP, { port: MODBUS.RELAY_PORT });
    client.setID(MODBUS.RELAY_ID);
    const estado = await client.readCoils(puerto, 1)//.then(data => data.data[puerto]);
    await client.writeCoil(puerto, !estado.data[puerto]);
    console.log("Relé activado");

    return { success: true, estado: !estado.data[puerto] };
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error Modbus:", err.message);
    } else {
      console.error("Error Modbus:", err);
    }
    return { success: false, error: err.message };
  }finally {
    client.close(); // 🔑 importante
  }
}

// module.exports = { activarRele };
