import { MODBUS } from "../config/constants.js";
// @ts-ignore
import ModbusRTU from "modbus-serial";

export const activarReleSalida = async (puerto) => {
  const client = new ModbusRTU();
  try {
    await client.connectTCP(MODBUS.RELAY_IP, { port: MODBUS.RELAY_PORT });
    client.setID(MODBUS.RELAY_ID);

    await client.writeCoil(puerto, true);
    console.log("Relé activado");

    setTimeout(async () => {
      await client.writeCoil(puerto, false);
      console.log("Relé desactivado");
      client.close();
    }, 300);
    return { success: true };

  } catch (err) {
    if (err instanceof Error) {
      console.error("Error Modbus:", err.message);
    } else {
      console.error("Error Modbus:", err);
    }
    return { success: false, error: err.message };
  }
}

// module.exports = { activarRele };
