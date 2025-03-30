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