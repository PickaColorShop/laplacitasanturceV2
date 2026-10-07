# La Placita de Santurce — Website

Hub oficial de los establecimientos de La Placita (Plaza del Mercado de Santurce).
Sitio estático (HTML + CSS + JS, sin frameworks) listo para **GitHub + Vercel**.

## Páginas
| Ruta | Archivo |
|---|---|
| `/` | `index.html` — Home con ubicación/horario, directorio filtrable por categoría y búsqueda |
| `/historia` | `historia.html` |
| `/tiendas` | `tiendas.html` — Mercado, puestos y kioscos |
| `/restaurantes` | `restaurantes.html` — Restaurantes, bares y discotecas (`/restaurantes#bares`, `#bailar`) |
| `/eventos` | `eventos.html` |
| `/promociones` | `promociones.html` |
| `/newsletter` | `newsletter.html` — Blog (se llama Newsletter). Artículos en `/newsletter/*.html` |
| `/contacto` | `contacto.html` — mapa, formulario y FAQ |

## Subir a GitHub y publicar en Vercel
1. En GitHub: **New repository** → nombre `laplacita-santurce` → Create.
2. **Add file → Upload files** → arrastra TODO el contenido de esta carpeta (no la carpeta, su contenido) → Commit.
3. En [vercel.com](https://vercel.com): **Add New → Project** → Import el repo.
   - Framework Preset: **Other** · Build Command: *(vacío)* · Output Directory: *(vacío)*
4. Deploy. Luego en **Settings → Domains** conecta el dominio de la clienta.

`vercel.json` ya activa URLs limpias (`/historia` en vez de `/historia.html`) y caché de assets.

> Para verlo en tu compu antes de subir: `npx serve .` dentro de la carpeta (abrir el `.html` con doble clic rompe los links que empiezan con `/`).

## Video de drone (hero del Home)
1. Exporta el video: MP4 (H.264), 1920×1080, 15–30 s en loop, **sin audio**, idealmente < 8 MB. Opcional: versión `.webm` (más liviana).
2. Súbelo a `assets/video/placita-drone.mp4` (y `.webm` si lo tienes) + una imagen fija `assets/img/hero-poster.jpg` (primer frame).
3. En `index.html`, dentro de `.hero-video__media`, quita los `<!-- -->` alrededor del `<video>` y borra el `<div class="ph">` placeholder.
El video se pausa solo cuando sales del hero y no se reproduce si el usuario tiene activado "reducir movimiento".

## Blog (Newsletter)
- Cada artículo es un archivo en `newsletter/` con su propio título, descripción y schema `BlogPosting`.
- Para un artículo nuevo: duplica uno de `newsletter/`, cambia título, `<meta name="description">`, `canonical`, el contenido y la fecha; agrégalo como tarjeta en `newsletter.html` y en `sitemap.xml`.

## Antes de lanzar (checklist)
- [ ] **Dominio**: buscar y reemplazar `https://www.laplacitasanturce.com` en todos los archivos (canonical, Open Graph, sitemap, robots, schema).
- [ ] **Fotos**: cada `<div class="ph" ...>` es un placeholder. Reemplázalo por
  `<img src="/assets/img/santaella.webp" alt="Plato de Santaella en La Placita de Santurce" width="800" height="500" loading="lazy">`
  (usa WebP, ~200 KB máx., alt descriptivo con "La Placita de Santurce").
- [ ] **Imagen social**: subir `/assets/img/og-placita.jpg` (1200×630).
- [ ] **Datos**: revisar `VERIFICAR.md` — direcciones/nombres por confirmar, horarios, eventos y promos de ejemplo.
- [ ] **Formularios** (newsletter, contacto): ahora muestran un mensaje de éxito de prueba. Para conectarlos:
  - HubSpot: reemplazar el `<form>` por el embed de HubSpot Forms, o poner en `action` la URL de envío.
  - Mailchimp: pegar la `action` del formulario embebido de Mailchimp.
  - Si el `<form>` tiene un `action` real, el JS lo deja enviar normal.
- [ ] Google Search Console: verificar dominio y enviar `sitemap.xml`.
- [ ] Google Business Profile: que la web apunte a este dominio.

## Editar contenido
- Horario del indicador "Abierto/Cerrado": `assets/js/main.js` → `PLACITA_HOURS` (hora de PR).
- Colores y fuentes: variables al inicio de `assets/css/styles.css`.
- Agregar un establecimiento: copia un `<article class="card" data-cat="...">` en la página; `data-cat` puede ser `comer`, `bares`, `bailar`, `mercado`, `antojos`. Actualiza también el contador del chip.

## SEO incluido
Títulos y descripciones únicos por página, `lang="es-PR"`, canonical, Open Graph/Twitter, geo-tags,
datos estructurados (TouristAttraction + LocalBusiness con horario y coordenadas, ItemList de establecimientos,
Events, FAQPage, Breadcrumbs), `sitemap.xml`, `robots.txt`, HTML semántico, fuentes self-hosted con preload,
y animaciones que respetan `prefers-reduced-motion`.
