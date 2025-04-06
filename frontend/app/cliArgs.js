import { parseArgs } from "util";

/**
 * Parses command line arguments for the application.
 * @returns {object} Object containing parsed CLI arguments
 */
export function parseCliArgs() {
  const options = {
    // Define supported command line arguments here
    vault: {
      type: "string",
      description: "Directory path to the vault location",
    },
  };

  const { values } = parseArgs({
    args: getArgv(),
    options,
  });

  return {
    vaultPath: values.vault,
  };
}

function getArgv() {
  // Running in dev mode will have ["Electron", "."] as first two args
  if (process.argv[0].endsWith("Electron")) {
    return process.argv.slice(2);
  }

  // In production mode it will just be ["Oblivion Ark.app/Contents/MacOS/Oblivion Ark"]
  return process.argv.slice(1);
}
