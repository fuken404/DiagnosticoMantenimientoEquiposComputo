// back/seed_rules.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import Rule from "./models/Rule.js";

dotenv.config();

const filePath = path.resolve(process.cwd(), "Arbol de Decision.json");

/* ===== helpers ===== */
const norm = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const slug = s => norm(String(s ?? "").trim().toLowerCase())
  .replace(/[¿?]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");
const isStr = v => typeof v === "string";
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
const isArr = Array.isArray;
const keys = o => (isObj(o) ? Object.keys(o) : []);
const isQuestionKey = k => {
  const t = String(k ?? "").trim();
  return t.startsWith("¿") || t.endsWith("?");
};

function normalizeAnswer(ansRaw) {
  const a = norm(String(ansRaw ?? "").trim().toLowerCase());
  if (["si","sí","sí","yes","y","1","true"].includes(a)) return "SI";
  if (["no","n","0","false"].includes(a)) return "No";
  return String(ansRaw ?? "").trim();
}

/* ===== MAP pregunta::respuesta -> id de síntoma del front =====
   Ajusta estos pares para alinear condiciones con tus IDs (no_power, beeps_present, etc.) */
const MAP = {
  "¿El Equipo Enciende?::No": "no_power",
  "¿El Equipo Enciende?::SI": "power_on",

  "¿Qué sucede al encender?::Ventiladores Funcionan pero No Hay Imagen": "fans_spin_no_image",
  "¿Qué sucede al encender?::Se Muestra Imagen pero no Inicial el SO": "shows_image_no_boot",
  "¿Qué sucede al encender?::Se Muestra Imagen e Inicia SO pero Está muy Lento": "very_slow",

  "¿Monitor Tiene Señal o Retroalimentación?::Si": "monitor_has_signal",
  "¿Monitor Tiene Señal o Retroalimentación?::No": "monitor_no_signal",

  "Cable Video y Monitor Encendido::SI": "video_cable_ok",
  "Cable Video y Monitor Encendido::No": "video_cable_bad",

  "¿Emite Pitidos al Arrancar::SI": "beeps_present",
  "¿Emite Pitidos al Arrancar::No": "no_beeps",

  "¿Qué Pitidos Emite?::1 Largo 2 Cortos": "beeps_1l2s",
  "¿Qué Pitidos Emite?::Pitidos Continuos": "beeps_continuous",
  "¿Qué Pitidos Emite?::Código Beep Distinto": "beeps_other",

  "¿Se Puede Ingresar a la Bios?::SI": "bios_accessible",
  "¿Se Puede Ingresar a la Bios?::No": "bios_inaccessible",

  "¿Detecta Disco en BIOS?::SI": "disk_detected",
  "¿Detecta Disco en BIOS?::No": "disk_not_detected",

  "¿Aparece Mensaje no Arranque o Boot Error?::Si": "boot_error",
  "¿Aparece Mensaje no Arranque o Boot Error?::NO": "no_boot_error",

  "¿El Sistema Inicia y Luego falla con BSOD o Reinicio?::Si": "bsod_or_restarts",
  "¿El Sistema Inicia y Luego falla con BSOD o Reinicio?::No": "no_bsod",

  "¿Disco con Errores SMART o Alta Ocupacion?::Si": "smart_errors",
  "¿Disco con Errores SMART o Alta Ocupacion?::NO": "no_smart_errors",

  "¿Se Reinicia Solo o se Apaga sin Aviso?::SI": "random_restart",
  "¿Se Reinicia Solo o se Apaga sin Aviso?::NO": "no_random_restart",

  "¿Hay Sobrecalentamiento?::Si": "overheat",
  "¿Hay Sobrecalentamiento?::No": "no_overheat",

  "¿Los Periféricos Funcionan Correctamente?::SI": "peripherals_ok",
  "¿Los Periféricos Funcionan Correctamente?::NO": "peripherals_fail",

  "¿Se Detectan en Bios?::Si": "peripherals_detected_bios",
  "¿Se Detectan en Bios?::No": "peripherals_not_detected_bios",

  "¿Imagen Presenta Parpadeos o Lineas?::Si": "image_flicker",
  "¿Imagen Presenta Parpadeos o Lineas?::NO": "no_image_flicker",

  "¿Sonido Funciona Correctamente?::SI": "sound_ok",
  "¿Sonido Funciona Correctamente?::No": "sound_fail",

  "¿Red y WiFi Funcionan Correctamente?::Si": "network_ok",
  "¿Red y WiFi Funcionan Correctamente?::No Detecta la Tarjeta": "net_card_not_detected",
  "¿Red y WiFi Funcionan Correctamente?::Detecta Tarjeta pero no Conecta": "net_detects_no_connect"
};

function conditionFor(question, answer) {
  const key = `${question}::${answer}`;
  if (MAP[key]) return MAP[key];
  return `${slug(answer)}_${slug(question).slice(0, 24)}`; // slug temporal si no está en MAP
}

/* ===== detección de hoja ===== */
function isLeaf(node) {
  if (isStr(node)) return true;

  if (isObj(node)) {
    const ks = keys(node);

    // Si es un "envoltorio de pregunta" { "¿Pregunta...?": [...] } NO es hoja
    if (ks.length === 1 && isQuestionKey(ks[0])) return false;

    // Si contiene alguna clave que parece pregunta, NO es hoja
    if (ks.some(isQuestionKey)) return false;

    // Si las claves parecen ser respuestas (SI/No/...) pero
    // ALGÚN hijo es array/objeto (o sea, hay más niveles), NO es hoja
    if (ks.length) {
      const hasComplexChild = ks.some(k => isArr(node[k]) || isObj(node[k]));
      if (hasComplexChild) return false;
    }

    // Si llega aquí, no tiene hijos “complejos”: trátalo como hoja
    return true;
  }

  return false;
}


function leafInfo(node, autoId) {
  if (isStr(node)) {
    const label = node.trim();
    const m = label.match(/F(\d{2,})/i);
    const ruleId = m ? `F${m[1]}` : `F${String(autoId).padStart(2,"0")}`;
    return { ruleId, fault: label, advice: [] };
  }
  const id = node.id || node.ruleId || node.data?.id;
  const label = node.falla || node.fault || node.label || node.name || node.title || node.text || node.data?.label || node.data?.fault || "Falla";
  const advice = Array.isArray(node.advice) ? node.advice
                : Array.isArray(node.recommendations) ? node.recommendations
                : Array.isArray(node.data?.advice) ? node.data.advice
                : [];
  let ruleId = id || (label?.match(/F\\d{2,}/i)?.[0]);
  if (!ruleId) ruleId = `F${String(autoId).padStart(2,"0")}`;
  return { ruleId, fault: label || ruleId, advice };
}

/* ===== recorrido ===== */
function walk(node, currentQ, pathConds, outRules, ctx) {
  if (node == null) return;

  // hoja
  if (isLeaf(node)) {
    const { ruleId, fault, advice } = leafInfo(node, ctx.autoId++);
    outRules.push({ ruleId, conditions: [...pathConds], weight: 0.8, fault, advice });
    return;
  }

  // array: cada elemento puede ser {respuesta: sub} o {pregunta: [...]} o mezcla
  if (isArr(node)) {
    for (const entry of node) {
      if (isLeaf(entry)) {
        const { ruleId, fault, advice } = leafInfo(entry, ctx.autoId++);
        outRules.push({ ruleId, conditions: [...pathConds], weight: 0.8, fault, advice });
        continue;
      }
      if (isObj(entry)) {
        const ks = keys(entry);
        for (const k of ks) {
          const child = entry[k];
          if (isQuestionKey(k)) {
            // k es una Pregunta -> child debería ser array u objeto
            walk(child, k, pathConds, outRules, ctx);
          } else {
            // k es una Respuesta a currentQ
            const ans = normalizeAnswer(k);
            const cond = conditionFor(currentQ ?? "decision", ans);
            walk(child, currentQ, [...pathConds, cond], outRules, ctx);
          }
        }
      } else {
        // tipos simples
        walk(entry, currentQ, pathConds, outRules, ctx);
      }
    }
    return;
  }

  // objeto: puede ser {Pregunta: [...] } o {Respuesta: sub} o mezcla
  if (isObj(node)) {
    const ks = keys(node);
    // si el objeto solo tiene una clave y parece pregunta
    if (ks.length === 1 && isQuestionKey(ks[0])) {
      const q = ks[0];
      walk(node[q], q, pathConds, outRules, ctx);
      return;
    }
    // si hay varias claves, puede ser mezcla de respuestas y preguntas
    for (const k of ks) {
      const child = node[k];
      if (isQuestionKey(k)) {
        walk(child, k, pathConds, outRules, ctx);
      } else {
        // tratar como respuesta a la pregunta vigente
        const ans = normalizeAnswer(k);
        const cond = conditionFor(currentQ ?? "decision", ans);
        walk(child, currentQ, [...pathConds, cond], outRules, ctx);
      }
    }
  }
}

/* ===== pipeline ===== */
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "expertos" });
  console.log("Conectado a Mongo. Transformando reglas…");

  const input = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const top = keys(input);
  if (top.length !== 1) {
    console.error("Claves nivel 1:", top);
    throw new Error("Se esperaba un objeto con una sola pregunta raíz.");
  }

  const rootQ = top[0];
  const subtree = input[rootQ];

  const rules = [];
  const ctx = { autoId: 1 };

  if (isArr(subtree)) {
    // ejemplo real: un array cuyo primer elemento tenía { "NO": [...], "SI": [...] }
    for (const entry of subtree) {
      if (isObj(entry)) {
        for (const k of keys(entry)) {
          const child = entry[k];
          if (isQuestionKey(k)) {
            // en raro caso que viniera como { "¿Otra?": [...] } al nivel raíz
            walk(child, k, [], rules, ctx);
          } else {
            // Respuesta directa a la raíz
            const ans = normalizeAnswer(k);
            const cond = conditionFor(rootQ, ans);
            walk(child, rootQ, [cond], rules, ctx);
          }
        }
      } else {
        walk(entry, rootQ, [], rules, ctx);
      }
    }
  } else {
    // raíz como objeto o string
    if (isQuestionKey(rootQ)) {
      walk(subtree, rootQ, [], rules, ctx);
    } else {
      walk(subtree, null, [], rules, ctx);
    }
  }

  if (!rules.length) {
    console.error("DEBUG: no se generaron reglas. Revisa el archivo; imprime 2 niveles:");
    console.error("RootQ:", rootQ);
    console.error("Tipo subtree:", Array.isArray(subtree) ? "array" : typeof subtree);
    console.error("Primer elemento:", Array.isArray(subtree) ? JSON.stringify(subtree[0], null, 2) : JSON.stringify(subtree, null, 2));
    process.exit(1);
  }

  const allConds = Array.from(new Set(rules.flatMap(r => r.conditions)));
  console.log("Condiciones detectadas (ajusta MAP para IDs finales del front):");
  console.log(allConds.slice(0, 60));

  await Rule.deleteMany({});
  await Rule.insertMany(rules, { ordered: false });

  console.log(`Seed OK: ${rules.length} reglas insertadas`);
  await mongoose.disconnect();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
