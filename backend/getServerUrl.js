// serverUtils.js

const os = require('os');

// Function to get local IP address of the server
const getLocalIP = () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = '127.0.0.1'; // Default to localhost if no external IP is found

  for (const interfaceName in networkInterfaces) {
    for (const network of networkInterfaces[interfaceName]) {
      if (network.family === 'IPv4' && !network.internal) {
        ipAddress = network.address; // Get external (non-internal) IP address
        break;
      }
    }
  }

  return ipAddress;
};

// Function to get the full server URL (IP + port)
const getServerUrl = (port = 3001) => {
  const ipAddress = getLocalIP();
  return `https://${ipAddress}:${port}`;
};
const getOriginUrl = (port = 3000) => {
  const ipAddress = getLocalIP();
  return `https://${ipAddress}:${port}`;
};

module.exports = { getServerUrl, getOriginUrl };
