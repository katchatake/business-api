const { exec } = require('child_process');
require('dotenv').config({ path: './.env' });

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DIALECT } = process.env;

const command = `npx sequelize-auto -o "./src/models" -d ${DB_NAME} -h ${DB_HOST} -u ${DB_USER} -p ${DB_PORT} -x "${DB_PASSWORD}" -e ${DB_DIALECT} -l cjs`;

console.log('Running command:', command);

const child = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
});
