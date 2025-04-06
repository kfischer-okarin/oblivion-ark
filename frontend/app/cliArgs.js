import { parseArgs } from "util";

const OPTIONS = {
  vault: {
    type: "string",
    description: "Directory path to the vault location",
  },
  "driver-socket": {
    type: "string",
    description: "Path where a unix socket should be opened to drive the app",
  },
};

/**
 * Parses command line arguments for the application.
 * @returns {object} Object containing parsed CLI arguments
 */
export function parseCliArgs() {
  const { values } = parseArgs({
    args: getNormalizedCliArgs(),
    options: OPTIONS,
  });

  return {
    vaultPath: values.vault,
    driverSocketPath: values["driver-socket"],
  };
}

function getNormalizedCliArgs() {
  // Running in dev mode will have ["Electron", "."] as first two args
  if (process.argv[0].endsWith("Electron")) {
    return process.argv.slice(2);
  }

  // In production mode it will just be ["Oblivion Ark.app/Contents/MacOS/Oblivion Ark"]
  return process.argv.slice(1);
}
