/***** 1) Hechos observables (síntomas/estado) *****/
const SYMPTOMS = [
  // Encendido / energía
  { id: "no_power", label: "El equipo NO enciende (sin luces)" },
  { id: "power_cable_ok", label: "Cable de energía y toma están OK" },
  { id: "power_cable_bad", label: "Cable/toma con fallas (holgura/chispas)" },
  { id: "burn_smell", label: "Olor/señal de quemado" },
  { id: "no_burn_smell", label: "No hay olor a quemado" },
  { id: "power_button_ok", label: "Botón de encendido hace buen contacto" },
  { id: "power_button_bad", label: "Botón de encendido atascado / cableado suelto" },

  // POST / video
  { id: "fans_spin_no_image", label: "Ventiladores funcionan pero NO hay imagen" },
  { id: "monitor_has_signal", label: "El monitor enciende y muestra 'sin señal'" },
  { id: "monitor_no_signal", label: "Monitor sin retroiluminación/señal" },
  { id: "video_cable_ok", label: "Cable de video conectado y monitor encendido" },
  { id: "video_cable_bad", label: "Cable de video defectuoso / mala conexión" },
  { id: "beeps_present", label: "Emite pitidos al arrancar" },
  { id: "no_beeps", label: "NO emite pitidos" },
  { id: "beeps_1l2s", label: "Patrón beeps: 1 largo, 2 cortos" },
  { id: "beeps_continuous", label: "Pitidos continuos" },
  { id: "beeps_other", label: "Código de beeps distinto" },

  // BIOS / almacenamiento / arranque
  { id: "shows_image_no_boot", label: "Se muestra imagen pero NO inicia el SO" },
  { id: "bios_accessible", label: "Puedo ingresar a la BIOS" },
  { id: "bios_inaccessible", label: "NO puedo ingresar a la BIOS" },
  { id: "disk_detected", label: "Disco detectado en BIOS" },
  { id: "disk_not_detected", label: "Disco NO detectado en BIOS" },
  { id: "boot_error", label: "Mensaje de 'No boot' / 'Boot error'" },
  { id: "bsod_or_restarts", label: "BSOD o reinicio tras iniciar" },
  { id: "os_corrupt_signs", label: "Signos de SO/servicios críticos corruptos" },

  // Rendimiento / estabilidad
  { id: "very_slow", label: "El equipo inicia pero está MUY lento" },
  { id: "smart_errors", label: "Errores SMART o disco al 100% sostenido" },
  { id: "random_restart", label: "Se reinicia solo / se apaga sin aviso" },
  { id: "overheat", label: "Sobrecalentamiento (temperaturas altas)" },
  { id: "no_overheat", label: "NO hay signos de sobrecalentamiento" },

  // Periféricos / E/S
  { id: "peripherals_ok", label: "Periféricos funcionan correctamente" },
  { id: "peripherals_fail", label: "Periféricos con fallas (teclado/mouse/USB)" },
  { id: "peripherals_detected_bios", label: "Periféricos se detectan en BIOS" },
  { id: "peripherals_not_detected_bios", label: "Periféricos NO se detectan en BIOS" },
  { id: "image_flicker", label: "Imagen con parpadeos/líneas" },
  { id: "sound_ok", label: "Sonido OK" },
  { id: "sound_fail", label: "Sonido NO funciona" },
  { id: "net_card_not_detected", label: "No detecta la tarjeta de red" },
  { id: "net_detects_no_connect", label: "Detecta tarjeta pero NO conecta" },
  { id: "network_ok", label: "Red y Wi‑Fi funcionan correctamente" }
];

/***** 2) Reglas (25 fallas + estado OK) *****/
const KB = [
  // No enciende
  {
    id: "F01", if: ["no_power", "power_cable_bad"], weight: 0.95, then: {
      fault: "Falla 01: Cable o toma eléctrica defectuosa", advice: [
        "Probar otro cable y toma certificada.",
        "Revisar fusibles/regleta.",
        "Medir continuidad del cable."]
    }
  },
  {
    id: "F02", if: ["no_power", "power_cable_ok", "burn_smell"], weight: 0.95, then: {
      fault: "Falla 02: Componente quemado o cortocircuito", advice: [
        "Desconectar y revisar PSU/placa.",
        "Buscar componentes chamuscados/capacitores abombados.",
        "Probar con fuente externa."]
    }
  },
  {
    id: "F03", if: ["no_power", "power_cable_ok", "no_burn_smell", "power_button_ok"], weight: 0.9, then: {
      fault: "Falla 03: Fuente muerta o placa base dañada", advice: [
        "Probar otra PSU.",
        "Verificar 24‑pin ATX y 8‑pin CPU.",
        "Prueba cruzada de motherboard."]
    }
  },
  {
    id: "F04", if: ["no_power", "power_cable_ok", "no_burn_smell", "power_button_bad"], weight: 0.85, then: {
      fault: "Falla 04: Botón de power atascado/cableado defectuoso", advice: [
        "Revisar botón/cable del panel frontal.",
        "Puenteo momentáneo en pines PWR."]
    }
  },

  // Enciende sin imagen
  {
    id: "F05", if: ["fans_spin_no_image", "monitor_has_signal"], weight: 0.85, then: {
      fault: "Falla 05: Monitor encendido sin señal útil (monitor/panel)", advice: [
        "Probar otro monitor/entrada.",
        "Revisar firmware/menú del monitor."]
    }
  },
  {
    id: "F06", if: ["fans_spin_no_image", "monitor_no_signal", "video_cable_bad"], weight: 0.9, then: {
      fault: "Falla 06: Cable de video defectuoso o mala conexión", advice: [
        "Cambiar cable (HDMI/DP/DVI) y puerto.",
        "Asegurar clic de conector DP."]
    }
  },
  {
    id: "F07", if: ["fans_spin_no_image", "monitor_no_signal", "video_cable_ok", "no_beeps"], weight: 0.85, then: {
      fault: "Falla 07: Sin POST (probar GPU o RAM)", advice: [
        "Arrancar con GPU integrada si aplica.",
        "Reseat de RAM y limpieza de contactos."]
    }
  },
  {
    id: "F08", if: ["beeps_present", "beeps_1l2s"], weight: 0.9, then: {
      fault: "Falla 08: Error en tarjeta de video", advice: [
        "Reinstalar GPU, probar en otro equipo.",
        "Actualizar VBIOS/BIOS si procede."]
    }
  },
  {
    id: "F09", if: ["beeps_present", "beeps_continuous"], weight: 0.9, then: {
      fault: "Falla 09: Problema de memoria RAM", advice: [
        "Probar módulos individualmente.",
        "MemTest86; revisar perfiles XMP/EXPO."]
    }
  },
  {
    id: "F10", if: ["beeps_present", "beeps_other"], weight: 0.7, then: {
      fault: "Falla 10: Error de BIOS (código no estándar)", advice: [
        "Consultar tabla de beeps del fabricante.",
        "Actualizar/recuperar BIOS."]
    }
  },

  // Muestra imagen pero no inicia SO
  {
    id: "F11", if: ["shows_image_no_boot", "bios_inaccessible"], weight: 0.85, then: {
      fault: "Falla 11: BIOS inaccesible (placa/teclado)", advice: [
        "Probar otro teclado/puerto.",
        "Clear CMOS y revisar jumper/RTC."]
    }
  },
  {
    id: "F12", if: ["shows_image_no_boot", "bios_accessible", "disk_not_detected"], weight: 0.95, then: {
      fault: "Falla 12: Disco no detectado (físico o conexión)", advice: [
        "Revisar cables SATA/slot M.2 y tornillo.",
        "Probar en otro puerto/controladora."]
    }
  },
  {
    id: "F13", if: ["shows_image_no_boot", "bios_accessible", "disk_detected", "boot_error"], weight: 0.9, then: {
      fault: "Falla 13: Orden de arranque / MBR‑UEFI dañado", advice: [
        "Ajustar prioridad de arranque.",
        "Reparar BCD/ESP con medio de instalación."]
    }
  },
  {
    id: "F14", if: ["shows_image_no_boot", "bios_accessible", "disk_detected", "bsod_or_restarts"], weight: 0.8, then: {
      fault: "Falla 14: BSOD frecuentes (RAM o drivers)", advice: [
        "Actualizar drivers/BIOS.",
        "MemTest86 y descartar overclock."]
    }
  },
  {
    id: "F15", if: ["shows_image_no_boot", "bios_accessible", "disk_detected", "os_corrupt_signs"], weight: 0.75, then: {
      fault: "Falla 15: SO corrupto / drivers críticos dañados", advice: [
        "SFC/DISM, restauración del sistema.",
        "Reinstalar SO preservando datos."]
    }
  },

  // Inicia SO
  {
    id: "F16", if: ["very_slow"], weight: 0.7, then: {
      fault: "Falla 16: Módulo RAM defectuoso o mal asentado", advice: [
        "Reseat de RAM, probar slots.",
        "Verificar uso de memoria y swap."]
    }
  },
  {
    id: "F17", if: ["smart_errors"], weight: 0.9, then: {
      fault: "Falla 17: Disco con sectores dañados", advice: [
        "Respaldar datos ASAP.",
        "Clonado a SSD y reemplazo."]
    }
  },
  {
    id: "F18", if: ["random_restart", "overheat"], weight: 0.9, then: {
      fault: "Falla 18: Sobrecalentamiento (ventilación/pasta)", advice: [
        "Limpieza de polvo, cambio de pasta térmica.",
        "Curva de ventiladores y flujo de aire."]
    }
  },
  {
    id: "F19", if: ["random_restart", "no_overheat"], weight: 0.85, then: {
      fault: "Falla 19: Fuente de poder inestable o defectuosa", advice: [
        "Probar PSU conocida, medir voltajes.",
        "Revisar conectores ATX/PCIe."]
    }
  },
  {
    id: "F20", if: ["peripherals_fail", "peripherals_detected_bios"], weight: 0.8, then: {
      fault: "Falla 20: Drivers de periféricos en SO", advice: [
        "Reinstalar controladores del fabricante.",
        "Probar en modo seguro."]
    }
  },
  {
    id: "F21", if: ["peripherals_fail", "peripherals_not_detected_bios"], weight: 0.9, then: {
      fault: "Falla 21: Puertos físicos/controladores de placa dañados", advice: [
        "Inspección de headers y soldaduras.",
        "Tarjeta PCIe de expansión como bypass."]
    }
  },
  {
    id: "F22", if: ["peripherals_ok", "image_flicker"], weight: 0.75, then: {
      fault: "Falla 22: Problema en GPU o cable/panel", advice: [
        "Cambiar cable y verificar refresco.",
        "Stress test GPU y reinstalación limpia de drivers."]
    }
  },
  {
    id: "F23", if: ["peripherals_ok", "sound_fail"], weight: 0.75, then: {
      fault: "Falla 23: Drivers de audio corruptos o HW de audio dañado", advice: [
        "Reinstalar driver/usar DDU para audio.",
        "Probar DAC/USB externo."]
    }
  },
  {
    id: "F24", if: ["net_card_not_detected"], weight: 0.9, then: {
      fault: "Falla 24: Tarjeta de red físicamente dañada", advice: [
        "Probar tarjeta/USB Ethernet alterna.",
        "Revisar BIOS (Onboard LAN)."]
    }
  },
  {
    id: "F25", if: ["net_detects_no_connect"], weight: 0.8, then: {
      fault: "Falla 25: Drivers o configuración de red", advice: [
        "Reinstalar drivers, limpiar caché de red.",
        "IP/DNS manual, probar otro SSID."]
    }
  },
  {
    id: "OK", if: ["network_ok", "peripherals_ok"], weight: 0.5, then: {
      fault: "Equipo en correcto funcionamiento", advice: [
        "Sin acciones correctivas; realizar mantenimiento preventivo."]
    }
  },
];

/***** 3) Motor de inferencia *****/
function diagnose(selected) {
  const results = KB.map(rule => {
    const total = rule.if.length;
    const hit = rule.if.filter(x => selected.has(x)).length;
    const coverage = hit / total;
    const score = coverage * rule.weight;
    return { id: rule.id, fault: rule.then.fault, advice: rule.then.advice, matched: hit, total, coverage, weight: rule.weight, score };
  }).filter(r => r.score > 0.15).sort((a, b) => b.score - a.score);
  return results;
}

/***** 4) UI *****/
const $symptoms = document.getElementById('symptoms');
const $results = document.getElementById('results');
const $kbPre = document.getElementById('kbPre');

function renderSymptoms() {
  $symptoms.innerHTML = '';
  SYMPTOMS.forEach(s => {
    const id = `sym_${s.id}`;
    const el = document.createElement('label');
    el.className = 'sym';
    el.innerHTML = `<input type="checkbox" id="${id}" data-sym="${s.id}"/> <span>${s.label}</span>`;
    $symptoms.appendChild(el);
  });
}

function getSelected() {
  const boxes = $symptoms.querySelectorAll('input[type="checkbox"]');
  const set = new Set();
  boxes.forEach(b => { if (b.checked) set.add(b.dataset.sym); });
  return set;
}

function pct(n) { return Math.round(n * 100); }

function renderResults(list, selected) {
  if (!list.length) {
    $results.innerHTML = `<div class=\"muted\">No hay hipótesis suficientes con los hechos actuales.</div>`;
    return;
  }
  $results.innerHTML = '';
  list.forEach((r, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'item';
    const percent = pct(r.score);
    const explainConds = KB.find(k => k.id === r.id).if.map(id => ({ id, label: SYMPTOMS.find(s => s.id === id)?.label || id, ok: selected.has(id) }));
    wrap.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <h3>${i + 1}. ${r.fault}</h3>
        <span class="badge">Score: ${percent}%</span>
      </div>
      <div class="bar" aria-label="confianza"><div class="fill" style="width:${percent}%"></div></div>
      <div class="explain">Coincidencias: ${r.matched}/${r.total} · Peso regla: ${pct(r.weight)}%</div>
      <ul class="explain">${explainConds.map(c => `<li>${c.ok ? "✅" : "▫️"} ${c.label}</li>`).join('')}</ul>
      <div class="muted" style="margin:6px 0 4px">Recomendaciones:</div>
      <ul>${r.advice.map(a => `<li>${a}</li>`).join('')}</ul>
    `;
    $results.appendChild(wrap);
  });
}

function exportCase(selected, results) {
  const payload = { timestamp: new Date().toISOString(), selected: Array.from(selected), results };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `caso_dx_${Date.now()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Eventos
renderSymptoms();
$kbPre.textContent = JSON.stringify(KB, null, 2);

document.getElementById('btnDiagnose').addEventListener('click', () => {
  const sel = getSelected();
  const res = diagnose(sel);
  renderResults(res, sel);
});

document.getElementById('btnLimpiar').addEventListener('click', () => {
  $symptoms.querySelectorAll('input[type="checkbox"]').forEach(b => b.checked = false);
  $results.innerHTML = '<div class="muted">Sin diagnóstico aún.</div>';
});

document.getElementById('btnExport').addEventListener('click', () => {
  const sel = getSelected();
  const res = diagnose(sel);
  exportCase(sel, res);
});

