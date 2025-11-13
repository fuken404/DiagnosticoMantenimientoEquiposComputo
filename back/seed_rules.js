// back/seed_rules.js
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import sequelize from "./db.js";
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
const uniq = list => Array.from(new Set(list));
const isQuestionKey = k => {
  const t = String(k ?? "").trim();
  return t.startsWith("¿") || t.endsWith("?");
};
const hasLeafMetadata = node => {
  if (!isObj(node)) return false;
  const textKeys = ["falla", "fault", "label", "name", "title", "text", "diagnostico", "description"];
  const idKeys = ["id", "ruleId"];
  const hasText = textKeys.some(k => typeof node[k] === "string" && node[k].trim().length > 0);
  if (hasText) return true;
  const hasId = idKeys.some(k => typeof node[k] === "string" && node[k].trim().length > 0);
  if (hasId) return true;
  if (Array.isArray(node.advice) || Array.isArray(node.recommendations)) return true;
  if (node.then && (typeof node.then.fault === "string" || Array.isArray(node.then.advice))) return true;
  if (node.data && (Array.isArray(node.data.advice) || typeof node.data.fault === "string")) return true;
  return false;
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

  "¿Monitor Tiene Señal o Retroalimentación?::SI": "monitor_has_signal",
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

  "¿Aparece Mensaje no Arranque o Boot Error?::SI": "boot_error",
  "¿Aparece Mensaje no Arranque o Boot Error?::No": "no_boot_error",

  "¿El Sistema Inicia y Luego falla con BSOD o Reinicio?::SI": "bsod_or_restarts",
  "¿El Sistema Inicia y Luego falla con BSOD o Reinicio?::No": "no_bsod",

  "¿Disco con Errores SMART o Alta Ocupacion?::SI": "smart_errors",
  "¿Disco con Errores SMART o Alta Ocupacion?::No": "no_smart_errors",

  "¿Se Reinicia Solo o se Apaga sin Aviso?::SI": "random_restart",
  "¿Se Reinicia Solo o se Apaga sin Aviso?::No": "no_random_restart",

  "¿Hay Sobrecalentamiento?::SI": "overheat",
  "¿Hay Sobrecalentamiento?::No": "no_overheat",

  "¿Los Periféricos Funcionan Correctamente?::SI": "peripherals_ok",
  "¿Los Periféricos Funcionan Correctamente?::No": "peripherals_fail",

  "¿Se Detectan en Bios?::SI": "peripherals_detected_bios",
  "¿Se Detectan en Bios?::No": "peripherals_not_detected_bios",

  "¿Imagen Presenta Parpadeos o Lineas?::SI": "image_flicker",
  "¿Imagen Presenta Parpadeos o Lineas?::No": "no_image_flicker",

  "¿Sonido Funciona Correctamente?::SI": "sound_ok",
  "¿Sonido Funciona Correctamente?::No": "sound_fail",

  "¿Red y WiFi Funcionan Correctamente?::SI": "network_ok",
  "¿Red y WiFi Funcionan Correctamente?::No Detecta la Tarjeta": "net_card_not_detected",
  "¿Red y WiFi Funcionan Correctamente?::Detecta Tarjeta pero no Conecta": "net_detects_no_connect"
};

const DEFAULT_ADVICE = {
  F01: [
    "Prueba con otro cable de poder y una toma diferente para descartar la línea.",
    "Verifica que la regleta o UPS no tenga el fusible disparado.",
    "Inspecciona la toma por olor o chispas antes de volver a energizar."
  ],
  F02: [
    "Desconecta el equipo inmediatamente para evitar más daño.",
    "Localiza el componente quemado revisando olor, hollín o zonas calientes.",
    "Sustituye el componente afectado y valida que no haya cortos en la placa."
  ],
  F03: [
    "Prueba la fuente con un multímetro o reemplazo temporal certificado.",
    "Verifica las tensiones en los conectores ATX/EPS.",
    "Si la fuente está bien, inspecciona la placa base en busca de cortos."
  ],
  F04: [
    "Revisa el cableado del botón de encendido hacia el header POWER_SW.",
    "Limpia el mecanismo del botón con aire comprimido y lubricante dieléctrico.",
    "Prueba encender usando el botón integrado de la placa para descartar el chasis."
  ],
  F05: [
    "Conecta el monitor a otro equipo y valida si entrega imagen.",
    "Revisa retroiluminación o daños visibles en el panel.",
    "Considera reemplazo del monitor si está en garantía."
  ],
  F06: [
    "Cambia el cable HDMI/DP por uno certificado y de buena calidad.",
    "Asegura que los conectores estén firmes y sin dobleces.",
    "Prueba otro puerto de la GPU o monitor para descartar fallos."
  ],
  F07: [
    "Retira la GPU dedicada y prueba con video integrado.",
    "Resetea BIOS/UEFI y prueba módulos de RAM por separado.",
    "Escucha códigos beep adicionales para identificar el componente."
  ],
  F08: [
    "Reinstala o sustituye la tarjeta de video y limpia contactos PCIe.",
    "Comprueba que los conectores de energía PCIe estén firmes.",
    "Actualiza los controladores GPU tras estabilizar el hardware."
  ],
  F09: [
    "Ejecuta memtest86 o diagnóstico equivalente durante varias pasadas.",
    "Prueba los módulos de memoria uno por uno en distintos slots.",
    "Limpia los contactos con borrador antiestático antes de reinstalar."
  ],
  F10: [
    "Haz un clear CMOS para restablecer la BIOS.",
    "Actualiza el firmware a la última versión estable del fabricante.",
    "Reemplaza la batería CMOS si muestra voltaje bajo."
  ],
  F11: [
    "Comprueba que el teclado funcione y reconozca la tecla DEL/F2.",
    "Desconecta periféricos USB que puedan bloquear el POST.",
    "Si persiste, revisa posibles daños en el chipset o teclado integrado."
  ],
  F12: [
    "Revisa y vuelve a conectar cables SATA/M.2 asegurando buen contacto.",
    "Prueba el disco en otro puerto o carcasa USB para verificar detección.",
    "Si no responde, planifica reemplazar el medio de almacenamiento."
  ],
  F13: [
    "Configura manualmente la prioridad de arranque para el disco correcto.",
    "Repara el MBR/UEFI usando el medio de instalación del sistema.",
    "Ejecuta herramientas como `bootrec /fixmbr` o `bcdboot`."
  ],
  F14: [
    "Actualiza drivers críticos (chipset, GPU) y la BIOS.",
    "Ejecuta diagnósticos de memoria (memtest) y verifica disipación.",
    "Revisa el visor de eventos para identificar el driver fallando."
  ],
  F15: [
    "Ejecuta `sfc /scannow` y `DISM /RestoreHealth` para reparar archivos.",
    "Considera restaurar el sistema o reinstalar limpio si persiste.",
    "Verifica integridad del disco antes de reinstalar."
  ],
  F16: [
    "Reasienta los módulos de RAM respetando la configuración dual channel.",
    "Comprueba compatibilidad consultando la QVL de la placa.",
    "Sustituye el módulo defectuoso tras identificarlo."
  ],
  F17: [
    "Respalda de inmediato la información crítica del disco.",
    "Ejecuta diagnósticos SMART extendidos del fabricante.",
    "Sustituye o clona el disco antes de que falle totalmente."
  ],
  F18: [
    "Limpia polvo de ventiladores y disipadores, y cambia la pasta térmica.",
    "Mejora el flujo de aire del gabinete ordenando cables.",
    "Ajusta curvas de ventilador en BIOS o software para evacuar calor."
  ],
  F19: [
    "Mide los voltajes de la fuente bajo carga con multímetro.",
    "Reemplaza la fuente por una certificada del wattage adecuado.",
    "Evita conectar demasiados periféricos a la misma línea."
  ],
  F20: [
    "Reinstala los drivers del periférico desde el fabricante.",
    "Elimina dispositivos fantasma en el administrador y conecta de nuevo.",
    "Prueba el periférico en otro puerto o equipo."
  ],
  F21: [
    "Inspecciona los puertos por daño físico, suciedad o soldaduras rotas.",
    "Utiliza aire comprimido y alcohol isopropílico para limpiarlos.",
    "Instala una tarjeta de expansión si el puerto integrado está dañado."
  ],
  F22: [
    "Revisa el cable del panel/monitor y prueba con otro display.",
    "Asegura la tarjeta gráfica en el slot y verifica los conectores.",
    "Descarta daños en el flex del panel si es un todo-en-uno."
  ],
  F23: [
    "Reinstala o actualiza los controladores de audio.",
    "Verifica que el dispositivo de salida correcto esté seleccionado.",
    "Prueba con una tarjeta de audio USB para descartar hardware."
  ],
  F24: [
    "Comprueba que los LEDs de la tarjeta de red enciendan al conectar cable.",
    "Reasienta la tarjeta o cambia de slot PCIe.",
    "Sustituye la tarjeta si presenta daño físico en el conector."
  ],
  F25: [
    "Restablece la pila TCP/IP (`netsh int ip reset`).",
    "Actualiza o reinstala los controladores de red inalámbrica/ethernet.",
    "Verifica credenciales, DHCP y políticas del router antes de reconectar."
  ]
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
    return hasLeafMetadata(node);
  }
  return false;
}


function leafInfo(node, autoId) {
  if (isStr(node)) {
    const label = node.trim();
    const m = label.match(/F(\d{2,})/i);
    const ruleId = (m ? `F${m[1]}` : `F${String(autoId).padStart(2,"0")}`).toUpperCase();
    const advice = DEFAULT_ADVICE[ruleId] || [];
    return { ruleId, fault: label, advice };
  }
  const id = node.id || node.ruleId || node.data?.id;
  const label = node.falla || node.fault || node.label || node.name || node.title || node.text || node.data?.label || node.data?.fault || "Falla";
  const advice = Array.isArray(node.advice) ? node.advice
                : Array.isArray(node.recommendations) ? node.recommendations
                : Array.isArray(node.data?.advice) ? node.data.advice
                : [];
  let ruleId = id || (label?.match(/F\d{2,}/i)?.[0]);
  if (!ruleId) ruleId = `F${String(autoId).padStart(2,"0")}`;
  ruleId = ruleId.toUpperCase();
  const normalizedAdvice = advice.length ? advice : (DEFAULT_ADVICE[ruleId] || []);
  return { ruleId, fault: label || ruleId, advice: normalizedAdvice };
}

/* ===== recorrido ===== */
function walk(node, currentQ, pathConds, outRules, ctx) {
  if (node == null) return;

  // hoja
  if (isLeaf(node)) {
    const { ruleId, fault, advice } = leafInfo(node, ctx.autoId++);
    outRules.push({ ruleId, conditions: uniq(pathConds), weight: 0.8, fault, advice });
    return;
  }

  // array: cada elemento puede ser {respuesta: sub} o {pregunta: [...]} o mezcla
  if (isArr(node)) {
    for (const entry of node) {
      if (isLeaf(entry)) {
        const { ruleId, fault, advice } = leafInfo(entry, ctx.autoId++);
        outRules.push({ ruleId, conditions: uniq(pathConds), weight: 0.8, fault, advice });
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
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL conectado. Transformando reglas…");

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

    await Rule.destroy({ where: {} });
    await Rule.bulkCreate(rules);

    console.log(`Seed OK: ${rules.length} reglas insertadas`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
