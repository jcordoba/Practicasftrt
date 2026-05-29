const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function verifyAndAssignRoles() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL || 'postgresql://postgres:Jhstesro3526.@localhost:5432/practicasftr',
  });

  try {
    await client.connect();
    console.log('🔍 VERIFICACIÓN DE USUARIOS Y ROLES\n');
    console.log('='.repeat(60));

    // 1. Mostrar todos los usuarios con sus roles
    console.log('\n📋 USUARIOS REGISTRADOS Y SUS ROLES:\n');

    const usersQuery = `
      SELECT 
        u.id,
        u.email, 
        u.nombre,
        u.estado,
        r.nombre as rol_nombre,
        r.id as rol_id
      FROM "User" u 
      LEFT JOIN "UserRole" ur ON u.id = ur."userId" 
      LEFT JOIN "Role" r ON ur."roleId" = r.id 
      ORDER BY u.email, r.nombre
    `;

    const usersResult = await client.query(usersQuery);

    if (usersResult.rows.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos');
      await client.end();
      rl.close();
      return;
    }

    // Agrupar usuarios
    const usersMap = new Map();
    usersResult.rows.forEach((row) => {
      if (!usersMap.has(row.email)) {
        usersMap.set(row.email, {
          id: row.id,
          email: row.email,
          nombre: row.nombre,
          estado: row.estado,
          roles: [],
        });
      }
      if (row.rol_nombre) {
        usersMap.get(row.email).roles.push(row.rol_nombre);
      }
    });

    let userIndex = 1;
    usersMap.forEach((user) => {
      console.log(`${userIndex}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.nombre || 'N/A'}`);
      console.log(`   Estado: ${user.estado}`);

      if (user.roles.length > 0) {
        console.log(`   Roles:`);
        user.roles.forEach((role) => {
          console.log(`     ✓ ${role}`);
        });
      } else {
        console.log(`   ⚠️  Sin roles asignados`);
      }
      console.log('');
      userIndex++;
    });

    // 2. Mostrar roles disponibles
    console.log('\n📚 ROLES DISPONIBLES EN EL SISTEMA:\n');

    const rolesResult = await client.query('SELECT * FROM "Role" ORDER BY nombre');

    rolesResult.rows.forEach((role, index) => {
      console.log(`${index + 1}. ${role.nombre}`);
      console.log(`   ${role.descripcion || 'Sin descripción'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  IMPORTANTE: Para crear prácticas necesitas uno de estos roles:');
    console.log('   • COORDINADOR_PRACTICAS');
    console.log('   • ADMINISTRADOR_TECNICO');
    console.log('='.repeat(60));

    // 3. Preguntar si desea asignar un rol
    console.log('\n');
    const wantToAssign = await question(
      '¿Deseas asignar el rol COORDINADOR_PRACTICAS a un usuario? (s/n): ',
    );

    if (wantToAssign.toLowerCase() !== 's') {
      console.log('\n✓ Proceso finalizado sin cambios');
      rl.close();
      await client.end();
      return;
    }

    // 4. Pedir el email del usuario
    const userEmail = await question('\nIngresa el email del usuario: ');

    // Verificar que el usuario existe
    const userCheckResult = await client.query(
      'SELECT id, email, nombre FROM "User" WHERE email = $1',
      [userEmail],
    );

    if (userCheckResult.rows.length === 0) {
      console.log(`\n❌ No se encontró un usuario con el email: ${userEmail}`);
      rl.close();
      await client.end();
      return;
    }

    const targetUser = userCheckResult.rows[0];
    console.log(`\n✓ Usuario encontrado: ${targetUser.nombre || targetUser.email}`);

    // Verificar si ya tiene el rol
    const existingRoleResult = await client.query(
      `SELECT ur.id 
       FROM "UserRole" ur 
       JOIN "Role" r ON ur."roleId" = r.id 
       WHERE ur."userId" = $1 AND r.nombre = 'COORDINADOR_PRACTICAS'`,
      [targetUser.id],
    );

    if (existingRoleResult.rows.length > 0) {
      console.log('⚠️  Este usuario ya tiene el rol COORDINADOR_PRACTICAS');
      rl.close();
      await client.end();
      return;
    }

    // 5. Obtener el ID del rol COORDINADOR_PRACTICAS
    const roleResult = await client.query('SELECT id FROM "Role" WHERE nombre = $1', [
      'COORDINADOR_PRACTICAS',
    ]);

    if (roleResult.rows.length === 0) {
      console.log('\n❌ No se encontró el rol COORDINADOR_PRACTICAS en la base de datos');
      rl.close();
      await client.end();
      return;
    }

    const coordinatorRoleId = roleResult.rows[0].id;

    console.log('\n🔄 Asignando rol COORDINADOR_PRACTICAS...');

    // Asignar el rol
    await client.query(
      `INSERT INTO "UserRole" ("userId", "roleId", estado, fecha_creacion, fecha_actualizacion, fecha_asignacion)
       VALUES ($1, $2, 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [targetUser.id, coordinatorRoleId],
    );

    console.log('✅ Rol asignado exitosamente!');
    console.log('\n⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar sesión');
    console.log('   para que el nuevo rol se refleje en el token JWT.\n');

    // Verificar la asignación
    const verifyResult = await client.query(
      `SELECT r.nombre 
       FROM "UserRole" ur 
       JOIN "Role" r ON ur."roleId" = r.id 
       WHERE ur."userId" = $1`,
      [targetUser.id],
    );

    console.log('📋 Roles actuales del usuario:');
    verifyResult.rows.forEach((row) => {
      console.log(`   ✓ ${row.nombre}`);
    });
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await client.end();
  }
}

verifyAndAssignRoles();
