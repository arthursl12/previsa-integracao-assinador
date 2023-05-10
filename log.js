const fs = require("fs");

/**
 * Escreve a mensagem no console e no log, com a timestamp
 * @param {str} message - Mensagem a ser logada
 */
function log(message, logFile = "script.log") {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}`;
  console.log(fullMessage);
  fs.appendFileSync(logFile, `${fullMessage}\n`);
}

module.exports = {
  log,
};
