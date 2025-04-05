import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const INCLUDED_FILES = [
  // App Root is "", whole app will be ignored if not included
  "",
  "/package.json",
];

const INCLUDED_DIRS = ["/app", "/dist"];

const config = {
  packagerConfig: {
    ignore: (file) => {
      if (INCLUDED_DIRS.some((dir) => file.startsWith(dir))) {
        return false;
      }
      if (INCLUDED_FILES.includes(file)) {
        return false;
      }

      return true;
    },
    overwrite: true,
  },
  rebuildConfig: {},
  makers: [],
  plugins: [
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      // Don't allow node cli options in built app
      [FuseV1Options.RunAsNode]: false,
      // Encrypt stored cookies
      [FuseV1Options.EnableCookieEncryption]: true,
      // Don't allow node options in built app
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      // Don't allow node inspect cli options in built app
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
    }),
  ],
};

export default config;
