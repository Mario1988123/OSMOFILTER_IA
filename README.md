# OsmoIA - Asistente Técnico Inteligente

PWA de servicio técnico con IA para tratamiento de agua.

## Características

- **Chat con IA**: Asistente inteligente que responde preguntas técnicas basándose en la base de conocimiento
- **Panel de Admin**: Gestión completa de productos, errores/soluciones y conocimiento
- **Base de Conocimiento**: Sistema de aprendizaje donde puedes añadir información para que la IA aprenda
- **Consultas Pendientes**: Las preguntas que la IA no puede responder quedan guardadas para revisión
- **Solicitudes de Contacto**: Sistema de captura de leads cuando la IA no puede ayudar
- **PWA**: Instalable como aplicación en móvil y escritorio
- **Offline**: Funciona sin conexión gracias al Service Worker
- **Diseño Moderno**: Interfaz con glassmorphism, gradientes y animaciones

## Cómo ejecutar en local

### Opción 1: Con Python (más fácil)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -SimpleHTTPServer 8000
```

Luego abre: http://localhost:8000

### Opción 2: Con Node.js

```bash
# Instalar serve globalmente
npm install -g serve

# Ejecutar
serve .
```

### Opción 3: Con VS Code

Instala la extensión "Live Server" y haz clic en "Go Live"

### Opción 4: Abrir directamente

Simplemente abre el archivo `index.html` en tu navegador (algunas funciones PWA pueden no funcionar)

## URLs

- **Web pública (Chat IA)**: `http://localhost:8000/index.html`
- **Panel de Admin**: `http://localhost:8000/admin-panel-7x9k2m/index.html`

> La URL del admin es "secreta" para que solo la conozcas tú

## Cómo usar

### 1. Añadir productos

1. Ve al Panel de Admin
2. Pestaña "Productos" → "Añadir Producto"
3. Rellena:
   - Referencia del proveedor
   - Nombre comercial
   - Nombre alternativo (opcional)
   - Descripción
   - Categoría
4. Añade errores comunes y sus soluciones
5. Guarda

### 2. Añadir conocimiento

1. Panel Admin → "Base de Conocimiento"
2. Clic en "Añadir Conocimiento"
3. Pega cualquier información técnica que quieras que la IA aprenda
4. Añade palabras clave para mejor búsqueda
5. Guarda

### 3. Revisar consultas pendientes

Cuando la IA no está segura de una respuesta, la guarda en "Consultas Pendientes". Puedes:
- Responder y añadir a la base de conocimiento
- Ignorar si no es relevante

### 4. Gestionar contactos

Los clientes que solicitan contacto aparecen en "Solicitudes de Contacto". Puedes:
- Marcar como contactado
- Eliminar

## Almacenamiento

Todo se guarda en **localStorage** del navegador:
- No necesita base de datos
- Los datos persisten entre sesiones
- Cada navegador tiene sus propios datos

### Backup de datos

En la consola del navegador (F12):

```javascript
// Exportar datos
JSON.stringify(OsmofilterIA.exportData())

// Importar datos
OsmofilterIA.importData(tusDatos)
```

## Estructura del proyecto

```
OSMOFILTER_IA/
├── index.html              # Página principal (chat IA)
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker
├── admin-panel-7x9k2m/     # Panel de administración
│   └── index.html
├── css/
│   ├── styles.css          # Estilos principales
│   └── admin.css           # Estilos del admin
├── js/
│   ├── ia.js               # Motor de IA
│   ├── app.js              # Lógica de la app
│   └── admin.js            # Lógica del admin
└── assets/
    └── icons/
        └── icon.svg        # Icono de la app
```

## Tecnologías

- HTML5, CSS3, JavaScript (Vanilla)
- LocalStorage para persistencia
- Service Worker para PWA
- Glassmorphism + CSS Animations

## Personalización

### Cambiar colores

Edita las variables CSS en `css/styles.css`:

```css
:root {
    --gradient-start: #667eea;
    --gradient-end: #764ba2;
    --primary-color: #667eea;
}
```

### Añadir más conocimiento base

Edita el array `baseKnowledge` en `js/ia.js`

## Licencia

MIT
