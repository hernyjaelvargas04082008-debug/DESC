# DESC Bot - Tutor de Comunicación Asertiva con Google Gemini 🚀

Aplicación web interactiva para resolver conflictos académicos y laborales utilizando la **Técnica DESC** (Describir, Expresar, Sugerir, Consecuencias), potenciada por **Google Gemini AI**.

---

## ⚡ Cómo ejecutar la aplicación en tu computadora (Local)

Ejecutarlo en tu propia máquina es muy fácil y no necesitas Vercel.

### 1. Requisitos previos
- Tener instalado **Node.js** (versión 18 o superior) o **Bun**.  
  *(Si no tienes Node.js, descárgalo gratis desde [nodejs.org](https://nodejs.org))*.

---

### 2. Pasos de instalación

1. **Abre la terminal o consola** (CMD, PowerShell o Terminal en Mac/Linux) dentro de la carpeta del proyecto.

2. **Instala las dependencias**:
   ```bash
   npm install
   ```
   *(O si usas Bun: `bun install`)*

3. **Crea el archivo `.env` para tu clave de Gemini**:
   En la raíz del proyecto, crea un archivo llamado `.env` y pega lo siguiente:
   ```env
   GEMINI_API_KEY=AIzaSyTuClaveRealDeGoogleAqui
   ```
   > 💡 **¿Dónde consigues la clave gratis?**  
   > Entra a [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey), inicia sesión con tu cuenta de Google y haz clic en **"Create API Key"**.

4. **Inicia el servidor**:
   ```bash
   npm run dev
   ```
   *(O si usas Bun: `bun dev`)*

5. **Abre tu navegador** en:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 ¿Cómo comprobar que la IA está activa?

Abre en tu navegador:
```
http://localhost:3000/api/health
```
Si tu clave está bien configurada verás:
```json
{
  "status": "ok",
  "geminiKeyConfigured": true,
  "platform": "node-express"
}
```

¡Listo! Ya puedes usar el Generador DESC, el Simulador de Casos y el Chat Tutor con la IA de Google Gemini funcionando al 100%.
