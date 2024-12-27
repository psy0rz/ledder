import * as os from "node:os"


function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
}

export function interpretMacro(inputString) {
  const ipAddress = getLocalIpAddress();
  return inputString.replace(/%i/g, ipAddress);
}
