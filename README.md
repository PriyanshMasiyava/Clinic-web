# Sujal Physio — Physiotherapy Guidance Services Website

A simple, modern, and fully responsive single-page website for **Makwana Sujal Hiteshbhai**, a Final-Year Bachelor of Physiotherapy (B.P.T.) student at C. U. Shah Physiotherapy College.

---

## 🌐 Live Preview

> Run locally using the instructions below. Not yet deployed.

---

## 👤 About the Client

| Field | Details |
|---|---|
| **Name** | Makwana Sujal Hiteshbhai |
| **Qualification** | Final-Year B.P.T. Student |
| **College** | C. U. Shah Physiotherapy College |
| **Email** | makwanasujal27@gmail.com |
| **WhatsApp / Phone** | +91 85110 57556 |

---

## 📋 Features

- **Hero Section** — Name, qualification badge, professional headline ("Move Better. Live Better."), client photograph, and two CTA buttons
- **About Section** — Introduction, college details, stat cards, and a professional disclaimer
- **Services Section** — 6 service cards with per-service WhatsApp enquiry buttons:
  - Mobility & Flexibility Exercise Guidance
  - Posture & Ergonomic Guidance
  - Stretching & Exercise Guidance
  - General Mobility Support
  - Sports Warm-up Guidance
  - Supervised Rehabilitation Activities
- **FAQ Section** — 5 accordion questions about qualifications and services
- **Contact Section** — Phone, WhatsApp, email links; enquiry form that redirects to WhatsApp
- **Floating WhatsApp Button** — Always-visible pulse button for quick contact
- **Rule-Based Chatbot** — Service navigation assistant with emergency/medical safety responses
- **Scroll-to-Top Button** — Appears on scroll
- **Smooth Scrolling & Fade-In Animations** — `prefers-reduced-motion` safe
- **Fully Responsive** — Tested at 320px, 375px, 425px, 480px, 600px, 768px, 860px, 1024px, 1200px, and 1440px

---

## 🗂️ Project Structure

```
doctorproject/
├── index.html          # Main single-page HTML (semantic, no inline CSS/JS)
├── css/
│   ├── style.css       # All website styles + responsive breakpoints (~1100 lines)
│   └── chatbot.css     # Chatbot-specific styles
├── js/
│   ├── main.js         # Navigation, scroll, FAQ accordion, form → WhatsApp
│   └── chatbot.js      # Rule-based chatbot engine
├── photo/
│   └── Makwana Sujal.png   # Client photograph
└── .gitignore
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styles | CSS3 (custom properties, grid, flexbox, media queries) |
| Scripts | Vanilla JavaScript (ES6+, no frameworks) |
| Fonts | Google Fonts — Inter |
| Icons | Inline SVG |
| Contact | WhatsApp API (`wa.me`), `mailto:`, `tel:` |

> No build tools, no npm, no frameworks — pure static files.

---

## 🎨 Colour Palette

| Name | Hex |
|---|---|
| Deep Teal | `#123B4A` |
| Healthcare Teal | `#2C8C89` |
| Soft Mint | `#F2F8F7` |
| White | `#FFFFFF` |

---

## 🚀 Running Locally

### Option 1 — Python (recommended, no install needed)

```bash
# Python 3
python -m http.server 3000
```

Then open **http://localhost:3000** in your browser.

### Option 2 — VS Code Live Server

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
2. Right-click `index.html` → **Open with Live Server**.

### Option 3 — Any static file server

The project is pure HTML/CSS/JS — serve the root folder with any static server.

---

## 📱 Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| 1440px | Large desktop |
| 1200px | Laptop |
| 1024px | Small laptop / tablet landscape |
| 860px | Tablet portrait (columns stack) |
| 768px | iPad |
| 600px | Large phone |
| 480px | iPhone Plus / large Android |
| 425px | Standard Android |
| 375px | Standard iPhone |
| 320px | iPhone SE / small Android |

---

## ⚠️ Disclaimer

All services listed on this website are provided as **physiotherapy guidance activities** under the scope of a supervised final-year B.P.T. student practice. This website is **not a substitute** for professional medical advice, diagnosis, or independent clinical treatment by a licensed healthcare provider.

---

## 📄 License

This project is built for personal use by Makwana Sujal Hiteshbhai. All rights reserved.
