import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

export default {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
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
      // Validate the integrity of the asar archive on startup
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      // Force the app to run from the asar archive
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
