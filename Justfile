# Make sure electron also runs from inside VS Code
unexport ELECTRON_RUN_AS_NODE

[working-directory: 'frontend']
run:
  npx electron .