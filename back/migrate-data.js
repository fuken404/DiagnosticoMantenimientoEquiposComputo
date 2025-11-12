#!/usr/bin/env node

/**
 * Script para migrar datos de MongoDB a PostgreSQL
 * Uso: node back/migrate-data.js
 * 
 * Este script:
 * 1. Se conecta a MongoDB
 * 2. Extrae todos los usuarios, reglas y casos
 * 3. Los inserta en PostgreSQL
 * 4. Verifica la integridad de los datos
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import sequelize from "./db.js";
import User from "./models/User.js";
import Rule from "./models/Rule.js";
import Case from "./models/Case.js";

dotenv.config();

const migrateData = async () => {
  try {
    console.log("🔄 Iniciando migración de datos...\n");

    // Conectar a MongoDB
    console.log("📦 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, { 
      dbName: "expertos",
      useNewUrlParser: true,
      useUnifiedTopology: true 
    });
    console.log("✅ MongoDB conectado\n");

    // Conectar a PostgreSQL
    console.log("🐘 Conectando a PostgreSQL...");
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log("✅ PostgreSQL conectado\n");

    // Migrar Usuarios
    console.log("👥 Migrando usuarios...");
    const mongoUsers = await mongoose.connection.collection("users").find({}).toArray();
    if (mongoUsers.length > 0) {
      const usersData = mongoUsers.map(u => ({
        email: u.email,
        name: u.name || "",
        passwordHash: u.passwordHash,
        createdAt: u.createdAt || new Date(),
        updatedAt: u.updatedAt || new Date(),
      }));
      await User.bulkCreate(usersData, { ignoreDuplicates: true });
      console.log(`   ✓ ${usersData.length} usuarios insertados\n`);
    } else {
      console.log("   ℹ No hay usuarios para migrar\n");
    }

    // Migrar Reglas
    console.log("📋 Migrando reglas...");
    const mongoRules = await mongoose.connection.collection("rules").find({}).toArray();
    if (mongoRules.length > 0) {
      const rulesData = mongoRules.map(r => ({
        ruleId: r.ruleId,
        conditions: r.conditions || [],
        weight: r.weight || 0.7,
        fault: r.fault,
        advice: r.advice || [],
        createdAt: r.createdAt || new Date(),
        updatedAt: r.updatedAt || new Date(),
      }));
      await Rule.bulkCreate(rulesData, { ignoreDuplicates: true });
      console.log(`   ✓ ${rulesData.length} reglas insertadas\n`);
    } else {
      console.log("   ℹ No hay reglas para migrar\n");
    }

    // Migrar Casos
    console.log("📁 Migrando casos...");
    const mongoCases = await mongoose.connection.collection("cases").find({}).toArray();
    if (mongoCases.length > 0) {
      const casesData = mongoCases.map(c => ({
        timestamp: c.timestamp || new Date(),
        selected: c.selected || [],
        results: c.results || [],
        notes: c.notes || "",
        userId: c.user, // Mapear 'user' a 'userId'
        createdAt: c.createdAt || new Date(),
        updatedAt: c.updatedAt || new Date(),
      }));
      await Case.bulkCreate(casesData, { ignoreDuplicates: true });
      console.log(`   ✓ ${casesData.length} casos insertados\n`);
    } else {
      console.log("   ℹ No hay casos para migrar\n");
    }

    // Verificar integridad
    console.log("🔍 Verificando integridad de datos...");
    const userCount = await User.count();
    const ruleCount = await Rule.count();
    const caseCount = await Case.count();
    
    console.log(`   ✓ Usuarios: ${userCount}`);
    console.log(`   ✓ Reglas: ${ruleCount}`);
    console.log(`   ✓ Casos: ${caseCount}\n`);

    console.log("✨ ¡Migración completada exitosamente!");
    console.log("\n⚠️  RECOMENDACIONES:");
    console.log("   1. Verifica que los datos se migraron correctamente");
    console.log("   2. Haz una copia de seguridad de MongoDB");
    console.log("   3. Prueba la aplicación a fondo");
    console.log("   4. Cuando estés seguro, puedes eliminar MongoDB");

  } catch (error) {
    console.error("\n❌ Error en la migración:");
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await sequelize.close();
    process.exit(0);
  }
};

migrateData();
