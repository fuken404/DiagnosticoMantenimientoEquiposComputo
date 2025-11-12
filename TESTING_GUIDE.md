# 🧪 Guía de Pruebas - Sistema de Autenticación y Roles

## 📋 Checklist de Funcionalidades

### ✅ 1. Interfaz de Autenticación

- [ ] Modal de autenticación aparece al abrir la app
- [ ] Se puede cambiar entre "Iniciar sesión" y "Crear cuenta"
- [ ] Los campos de nombre se ocultan en login
- [ ] Se validan emails y contraseñas mínimas (8 caracteres)
- [ ] Los errores se muestran en rojo

### ✅ 2. Registro de Usuario

**Pasos:**
1. Abre http://localhost:5500
2. Haz clic en "¿No tienes cuenta? Regístrate aquí"
3. Rellena el formulario:
   - Email: `usuario@test.com`
   - Nombre: `Test Usuario`
   - Contraseña: `mipassword123`
4. Haz clic en "Crear cuenta"

**Resultados Esperados:**
- ✅ No aparecen errores
- ✅ Modal se cierra automáticamente
- ✅ Panel de usuario aparece (esquina superior derecha)
- ✅ Dice: "Test Usuario"
- ✅ Se carga la interfaz de diagnóstico

### ✅ 3. Login Estándar

**Pasos:**
1. Cierra sesión (botón rojo en esquina superior derecha)
2. Llena el login con el usuario creado
3. Email: `usuario@test.com`
4. Contraseña: `mipassword123`
5. Haz clic en "Iniciar sesión"

**Resultados Esperados:**
- ✅ Puedes acceder
- ✅ El nombre se muestra en el panel
- ✅ **No hay panel de administrador visible**

### ✅ 4. Crear Cuenta Admin (Opción 1: Vía SQL)

**En terminal:**
```bash
cd /Users/fuken404/Desktop/Proyectos/Uni/SisExp/DiagnosticoMantenimientoEquiposComputo

# Promocionar usuario a admin
./promote-admin.sh usuario@test.com
```

**Verificar:**
```bash
psql -U postgres -d expertos -c "SELECT email, role FROM users WHERE email = 'usuario@test.com';"
```

**Debería mostrar:** `usuario@test.com | admin`

### ✅ 5. Login como Admin

**Pasos:**
1. Cierra sesión
2. Login con: `usuario@test.com` / `mipassword123`
3. Observa el panel de usuario

**Resultados Esperados:**
- ✅ Panel muestra: "Test Usuario (👨‍💼 Admin)"
- ✅ **Panel de Administrador ahora es visible**
- ✅ Contiene form para crear nuevas reglas

### ✅ 6. Crear Nueva Regla como Admin

**Pasos:**
1. Como admin, rellena el formulario:
   - ID de Regla: `F99`
   - Falla/Diagnóstico: `Disco duro defectuoso (test)`
   - Peso: `0.8`
   - Condiciones: `no_power,disk_detected`
   - Recomendaciones: 
     ```
     Reemplaza el disco duro
     Verifica SMART con HD Sentinel
     Respalda datos antes de reemplazar
     ```

2. Haz clic en "Crear Regla"

**Resultados Esperados:**
- ✅ Alerta de éxito: "✅ Regla creada correctamente"
- ✅ Formulario se limpia
- ✅ KB se recarga automáticamente
- ✅ Nueva regla aparece en "Base de conocimientos"

### ✅ 7. Motor de Diagnóstico (Usuario Regular)

**Pasos:**
1. Cierra sesión del admin
2. Login como usuario regular (`usuario@test.com`)
3. Marca síntomas:
   - ✓ "El equipo NO enciende"
   - ✓ "Cable de energía OK"
4. Haz clic en "Diagnosticar"

**Resultados Esperados:**
- ✅ Aparecen hipótesis con scores
- ✅ Se muestran coincidencias y recomendaciones
- ✅ El caso se guarda en BD automáticamente

### ✅ 8. Exportar Caso

**Pasos:**
1. Haz un diagnóstico
2. Haz clic en "Exportar caso"

**Resultados Esperados:**
- ✅ Se descarga archivo JSON
- ✅ Nombre: `caso_dx_TIMESTAMP.json`
- ✅ Contiene síntomas seleccionados y scores

### ✅ 9. Logout

**Pasos:**
1. Haz clic en botón rojo "Cerrar sesión"

**Resultados Esperados:**
- ✅ Panel de usuario desaparece
- ✅ Modal de autenticación reaparece
- ✅ LocalStorage se limpia (sin sesión guardada)

### ✅ 10. Persistencia de Sesión

**Pasos:**
1. Login como usuario
2. Actualiza la página (F5)
3. Observe el estado

**Resultados Esperados:**
- ✅ Sigues logueado (sesión persiste en localStorage)
- ✅ Panel de usuario sigue visible
- ✅ No aparece modal de login

---

## 🔒 Pruebas de Seguridad

### ✅ 1. No hay acceso a panel admin sin autenticación

**Pasos:**
1. Abre http://localhost:5500 sin estar autenticado
2. Abre consola (F12) → Network
3. Intenta acceder a `/api/admin/rules`

**Resultado:**
```bash
curl http://localhost:4000/api/admin/rules
```
- ✅ Retorna 401 (no autenticado)

### ✅ 2. No hay acceso como usuario regular

**Pasos:**
1. Login como usuario regular
2. En consola del navegador:
```javascript
fetch('http://localhost:4000/api/admin/rules', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

**Resultado:**
- ✅ Retorna 403 (Forbidden - no es admin)

### ✅ 3. Validación de contraseña

**Pasos:**
1. Intenta registrarte con contraseña < 8 caracteres

**Resultado:**
- ✅ Error: "Password mínimo 8 caracteres"

### ✅ 4. Email duplicado

**Pasos:**
1. Crea usuario con: `test123@example.com`
2. Intenta crear otro con el mismo email

**Resultado:**
- ✅ Error: "Email ya registrado"

---

## 📊 Verificación de BD

### Ver todos los usuarios

```bash
psql -U postgres -d expertos -c "SELECT id, email, name, role, created_at FROM users;"
```

### Ver todas las reglas

```bash
psql -U postgres -d expertos -c "SELECT rule_id, fault, weight FROM rules LIMIT 20;"
```

### Ver casos de un usuario

```bash
psql -U postgres -d expertos -c "
  SELECT c.id, c.timestamp, c.selected, u.email 
  FROM cases c 
  JOIN users u ON c.user_id = u.id 
  WHERE u.email = 'usuario@test.com' 
  ORDER BY c.timestamp DESC;
"
```

### Verificar roles

```bash
psql -U postgres -d expertos -c "SELECT email, role FROM users;"
```

---

## 🐛 Debugging

### Habilitar logs en navegador
```javascript
// En consola del navegador
localStorage.debug = '*'
```

### Ver cookies
```javascript
// En consola del navegador
document.cookie
```

### Verificar token JWT
```javascript
// En consola del navegador
fetch('http://localhost:4000/api/auth/me', {
  credentials: 'include'
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### Ver logs del servidor
```bash
# Los logs deberían mostrar:
# - PostgreSQL conectado
# - Modelos sincronizados
# - API corriendo en http://localhost:4000
```

---

## 📱 Casos de Uso Completos

### Caso 1: Usuario diagnostica equipo
1. ✅ Se registra
2. ✅ Selecciona síntomas
3. ✅ Obtiene diagnóstico
4. ✅ Exporta caso
5. ✅ Se logout

### Caso 2: Admin crea nueva regla
1. ✅ Se registra como usuario normal
2. ✅ Admin lo promueve vía SQL
3. ✅ Usuario ve panel de admin
4. ✅ Crea nueva regla diagnóstica
5. ✅ Otros usuarios ven la nueva regla en diagnósticos

### Caso 3: Admin modifica regla existente
1. ✅ Admin login
2. ✅ Ve panel con form para crear/editar
3. ✅ (Futuro) Click en regla → edita campos → guarda

---

## ✅ Checklist Final

- [ ] Registro funciona
- [ ] Login funciona
- [ ] Panel de usuario muestra nombre y rol
- [ ] Usuarios regulares no ven panel admin
- [ ] Admins ven panel admin
- [ ] Admin puede crear nuevas reglas
- [ ] Nuevas reglas aparecen en motor de diagnóstico
- [ ] Logout limpia la sesión
- [ ] Actualizar página mantiene la sesión
- [ ] Diagnóstico funciona correctamente
- [ ] Casos se guardan en BD
- [ ] Exportación de casos funciona
- [ ] Seguridad: no hay acceso sin autenticación
- [ ] Seguridad: usuarios regulares no pueden acceder a `/api/admin`

---

**Última actualización:** 11 de noviembre de 2025
