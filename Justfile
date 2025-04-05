# Make sure electron also runs from inside VS Code
unexport ELECTRON_RUN_AS_NODE

default: run

[working-directory: 'frontend']
run:
  npx electron .

[working-directory: 'frontend']
lint:
  npx eslint .

[working-directory: 'frontend']
fix:
  npx eslint . --fix

[working-directory: 'frontend']
build: vite-build
  npx electron-forge package

[working-directory: 'frontend']
build-debug: vite-build
  DEBUG=electron-packager npx electron-forge package

[private]
[working-directory: 'frontend']
vite-build:
  npx vite build
