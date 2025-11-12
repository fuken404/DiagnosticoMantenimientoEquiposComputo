// back/seedLogic.js - Lógica compartida de seed
import fs from "node:fs";
import path from "node:path";

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
  if (["si","sí","sí","yes","y","1","true"].includes(a)) return "SI";
  if (["no","n","0","false"].includes(a)) return "No";
  return String(ansRaw ?? "").trim();
}

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
  return `${slug(answer)}_${slug(question).slice(0, 24)}`;
}

function isLeaf(node) {
  if (isStr(node)) return true;
  if (isObj(node)) {
    const ks = keys(node);
    if (ks.length === 1 && isQuestionKey(ks[0])) return false;
    if (ks.some(isQuestionKey)) return false;
    if (ks.length) {
      const hasComplexChild = ks.some(k => isArr(node[k]) || isObj(node[k]));
      if (hasComplexChild) return false;
    }
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
  let ruleId = id || (label?.match(/F\d{2,}/i)?.[0]);
  if (!ruleId) ruleId = `F${String(autoId).padStart(2,"0")}`;
  return { ruleId, fault: label || ruleId, advice };
}

function walk(node, currentQ, pathConds, outRules, ctx) {
  if (node == null) return;
  if (isLeaf(node)) {
    const { ruleId, fault, advice } = leafInfo(node, ctx.autoId++);
    outRules.push({ ruleId, conditions: [...pathConds], weight: 0.8, fault, advice });
    return;
  }
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
            walk(child, k, pathConds, outRules, ctx);
          } else {
            const ans = normalizeAnswer(k);
            const cond = conditionFor(currentQ ?? "decision", ans);
            walk(child, currentQ, [...pathConds, cond], outRules, ctx);
          }
        }
      } else {
        walk(entry, currentQ, pathConds, outRules, ctx);
      }
    }
    return;
  }
  if (isObj(node)) {
    const ks = keys(node);
    if (ks.length === 1 && isQuestionKey(ks[0])) {
      const q = ks[0];
      walk(node[q], q, pathConds, outRules, ctx);
      return;
    }
    for (const k of ks) {
      const child = node[k];
      if (isQuestionKey(k)) {
        walk(child, k, pathConds, outRules, ctx);
      } else {
        const ans = normalizeAnswer(k);
        const cond = conditionFor(currentQ ?? "decision", ans);
        walk(child, currentQ, [...pathConds, cond], outRules, ctx);
      }
    }
  }
}

export async function extractRulesFromJSON() {
  try {
    const filePath = path.resolve(process.cwd(), "Arbol de Decision.json");
    const input = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const top = keys(input);
    if (top.length !== 1) {
      throw new Error("Se esperaba un objeto con una sola pregunta raíz.");
    }

    const rootQ = top[0];
    const subtree = input[rootQ];
    const rules = [];
    const ctx = { autoId: 1 };

    if (isArr(subtree)) {
      for (const entry of subtree) {
        if (isObj(entry)) {
          for (const k of keys(entry)) {
            const child = entry[k];
            if (isQuestionKey(k)) {
              walk(child, k, [], rules, ctx);
            } else {
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
      if (isQuestionKey(rootQ)) {
        walk(subtree, rootQ, [], rules, ctx);
      } else {
        walk(subtree, null, [], rules, ctx);
      }
    }

    if (!rules.length) {
      throw new Error("No se generaron reglas del archivo JSON");
    }

    return rules;
  } catch (err) {
    console.error("Error extracting rules:", err);
    throw err;
  }
}
