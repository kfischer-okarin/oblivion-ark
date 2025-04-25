# Make sure electron also runs from inside VS Code
unexport ELECTRON_RUN_AS_NODE

default: run

[working-directory: 'desktop-app']
run:
  npx electron .

[working-directory: 'desktop-app']
lint:
  npx eslint .

[working-directory: 'desktop-app']
fix files="":
  npx eslint . --fix {{files}}

generate-classes:
  ruby scripts/generate_json_rpc_classes.rb

[working-directory: 'acceptance-tests']
acceptance-tests:
  bundle exec ruby test/*.rb

[working-directory: 'desktop-app']
build: vite-build
  npx electron-forge package

[working-directory: 'desktop-app']
build-debug: vite-build
  DEBUG=electron-packager npx electron-forge package

[private]
[working-directory: 'desktop-app']
vite-build:
  npx vite build
