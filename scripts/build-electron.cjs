const{execSync}=require('node:child_process');execSync('npx tsc -p src/main/tsconfig.main.json',{stdio:'inherit'});console.log('Built.');
