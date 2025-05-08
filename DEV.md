# 🧪 Desarrollo en Rama `dev` – Winclap Storyboard Generator

Este documento define el flujo de trabajo actual para desarrollo experimental y pruebas internas en la rama `dev`.

---

## 🚧 ¿Qué es la rama `dev`?

La rama `dev` es el entorno principal de trabajo para:
- Cambios grandes
- Integraciones en progreso (como Supabase, IA, colaboración)
- Pruebas internas sin afectar producción

Todos los **deploys automáticos de Vercel** se realizan como **Preview Deployments**.

---

## 🚀 Flujo de desarrollo

1. **Trabajá siempre en `dev`**
   ```bash
   git checkout dev
Hacé cambios, commit y push

bash
Copy
Edit
git add .
git commit -m "feat: integrar autosave colaborativo"
git push
Vercel deploya automáticamente a preview

URL tipo:

arduino
Copy
Edit
https://winclap-storyboard-generator-git-dev-bauroberts.vercel.app
Testear desde ese link antes de mergear a main

🛡️ Producción (main)
La rama main está conectada al entorno Production de Vercel.

Solo se hace deploy si vos lo hacés manualmente desde GitHub o CLI.

Para mergear:

bash
Copy
Edit
# Estás en dev
git checkout main
git merge dev
git push origin main
🔐 Esto dispara un deploy de producción en Vercel.

✅ Buenas prácticas
Usar commits claros (convención: feat:, fix:, refactor:)

Testear siempre en Preview antes de mergear

Evitá commits directos a main

🧠 Pendientes o mejoras futuras
 Proteger main con PR obligatorio

 Agregar integración CI (tests antes de mergear)

 Automatizar validaciones de contenido antes de deploy

tree -I "node_modules|.next|.git|public|.vscode|.DS_Store" -L 3