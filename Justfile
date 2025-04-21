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
fix files="":
  npx eslint . --fix {{files}}

generate-classes:
  ruby scripts/generate_json_rpc_classes.rb

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
