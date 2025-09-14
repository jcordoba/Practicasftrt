"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const _prisma_client_1 = require("@prisma-client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new _prisma_client_1.PrismaClient();
async function main() {
    console.log('Start seeding ...');
    // Seed Roles
    const predefinedRoles = [
        { name: 'ESTUDIANTE', description: 'Estudiante de la universidad' },
        { name: 'PASTOR_TUTOR', description: 'Pastor tutor' },
        { name: 'DOCENTE', description: 'Docente' },
        { name: 'COORDINADOR', description: 'Coordinador' },
        { name: 'DECANO', description: 'Decano' },
        { name: 'ADMIN_TECNICO', description: 'Administrador técnico' },
    ];
    for (const role of predefinedRoles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }
    console.log('Roles seeded.');
    // Seed Admin User
    const adminEmail = 'admin@sion.com';
    const adminPassword = 'admin'; // Change this in production
    const adminRoleName = 'ADMIN_TECNICO';
    const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminRole = await prisma.role.findUnique({ where: { name: adminRoleName } });
        if (adminRole) {
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Admin User',
                    isActive: true,
                    roles: {
                        create: {
                            roleId: adminRole.id,
                        },
                    },
                },
            });
            console.log('Admin user created.');
        }
        else {
            console.error(`Role '${adminRoleName}' not found. Cannot create admin user.`);
        }
    }
    console.log('Seeding finished.');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
