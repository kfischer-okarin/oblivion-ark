import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const config = {
  packagerConfig: {
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
