// rename-shell.mjs
import { copyFileSync } from 'fs'
copyFileSync('dist/client/_shell.html', 'dist/client/index.html')
