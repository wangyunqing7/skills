# Web Designer Guide

前端设计子代理的详细工作指南。

## 2026 Design Requirements (Mandatory)

### Glassmorphism

- Cards: `backdrop-filter: blur(20px)`, semi-transparent background
- Borders: Ultra-thin semi-transparent white

### Deep Background

- Default dark mode: deep space gray gradient + subtle particle animation (Canvas or CSS)
- Must include light/dark mode toggle button

### Neon Accents

- Primary: neon blue `#00f3ff` or neon purple `#bf00ff`
- Headings with `text-shadow` glow effect

### Micro-interactions

- Scroll: fade-in + float-up animations
- Hover: subtle scale + halo effect on cards

### Typography

- Sans-serif: Inter or system-ui
- Oversized headings, comfortable line-height

## Required Features Checklist

- [ ] Reading progress bar (top)
- [ ] Dark/light mode toggle
- [ ] Back-to-top button
- [ ] Auto-generated table of contents navigation
- [ ] Particle background animation
- [ ] Scroll-triggered fade-in animations
- [ ] Image lazy loading
- [ ] Responsive design (mobile/tablet/desktop)

## Content Mapping

| Markdown | HTML |
|----------|------|
| `#` heading | Hero Section |
| `##` headings | Independent Section cards |
| `![alt](images/x.png)` | `<img src="images/x.png" loading="lazy">` |

## Image Handling

```html
<!-- Correct -->
<div class="image-container">
  <img src="images/fig_1.png" alt="架构图" loading="lazy">
  <p class="image-caption">图1：描述</p>
</div>

<!-- Wrong: never use absolute paths or workspace prefix -->
<img src="output/images/fig_1.png">
```

## CSS Variables Template

```css
.image-container {
  width: 100%; max-width: 900px; margin: 40px auto;
  background: var(--glass-dark);
  border: 1px solid var(--border-dark);
  border-radius: 16px; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.image-container:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-neon);
}
.image-container img { width: 100%; height: auto; display: block; }
.image-caption {
  padding: 15px 20px; font-size: 0.9rem;
  opacity: 0.8; text-align: center;
  border-top: 1px solid var(--border-dark);
}
```

## Output Rules

- Single self-contained `{workspace}/index.html`
- ALL CSS/JS inlined — zero external CDN dependencies
- Use `assets/html_template.html` as starting skeleton if available
- Image paths: relative `images/xxx.png`, never include workspace prefix

## Completion JSON

```json
{
  "status": "success",
  "workspace": "{workspace}",
  "html_path": "{workspace}/index.html",
  "total_images": 3,
  "html_size": "125 KB",
  "features": ["reading_progress_bar", "theme_toggle", "back_to_top", "toc_navigation", "particle_background", "scroll_animations", "lazy_loading", "responsive_design"]
}
```
