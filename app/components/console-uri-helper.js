const { UriBuilder } = require("uu_appg01_core-uri");

const CONSOLE_USE_CASE_MAP = {
  logMessageg01: "logMessage",
  logMessageg02: "console/logMessage",
};

const ConsoleUri = {
  UcMap: {},

  get(dtoIn) {
    let consoleUri = UriBuilder.parse(dtoIn.consoleUri);
    let consoleCode = dtoIn.consoleCode;

    let uc;
    // TODO change configuration so that we do not need to hardcode different API of different products
    switch (consoleUri.toUri().getProduct()) {
      case "uu-console-maing02":
        uc = CONSOLE_USE_CASE_MAP.logMessageg02;
        break;
      default:
        uc = CONSOLE_USE_CASE_MAP.logMessageg01;
        break;
    }

    return consoleUri.setUseCase(uc).setParameter("code", consoleCode).toString();
  },
};

module.exports = ConsoleUri;
