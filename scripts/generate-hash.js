const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Error: Debes proporcionar una contraseña como argumento');
  console.log('Uso: node scripts/generate-hash.js "tu_contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
