# Voltz Digital - Web Design Agency Portfolio

A modern, professional portfolio website for "Voltz Digital" - a web design agency in Jamaica that builds lightning-fast websites for small businesses.

## Features

- **5 Complete Pages**: Home, Portfolio, Services, About, and Contact.
- **Responsive Design**: Mobile-first approach, looks great on all devices.
- **Modern UI/UX**: Clean layout, generous whitespace, and smooth animations.
- **Vanilla Tech Stack**: Built with pure HTML5, CSS3, and JavaScript (no heavy frameworks).
- **Performance Optimized**: Lightweight and fast-loading.
- **Interactive Elements**: Mobile menu, portfolio filtering, animated counters, scroll-to-top button.
- **Form Integration**: Contact form ready to be connected to Formspree.

## Setup Instructions

This project uses standard HTML, CSS, and JavaScript. You can run it locally using any static file server.

### Option 1: Using Vite (Current Environment)

Since this project is in a Vite environment, you can simply run:

```bash
npm run dev
```

Vite will automatically serve the `index.html` file from the root directory.

### Option 2: Using a Simple HTTP Server

If you have Python installed:
```bash
python -m http.server 3000
```

If you have Node.js installed, you can use `serve`:
```bash
npx serve .
```

## Customization Guide

### Colors

To change the color scheme, open `styles.css` and modify the CSS variables at the top of the file:

```css
:root {
  --primary: #0066FF; /* Electric Blue */
  --primary-dark: #0052CC;
  --secondary: #FFD700; /* Bright Yellow/Gold */
  --accent-dark: #0A1128; /* Dark Navy */
  /* ... */
}
```

### Images

Placeholder images from Unsplash and Pravatar are used throughout the site. To replace them, search for `<img>` tags in the HTML files and update the `src` attribute with your own image paths.

### Contact Form

To make the contact form functional:
1. Sign up for a free account at [Formspree](https://formspree.io/)
2. Create a new form
3. Copy your unique form endpoint URL
4. Open `contact.html` and replace `https://formspree.io/f/YOUR_FORM_ID` with your actual Formspree URL in the `<form action="...">` attribute.

### WhatsApp Button

To update the WhatsApp floating button and contact links, search for `https://wa.me/18760000000` in the HTML files and replace the number with your actual WhatsApp business number (include country code, no + or spaces).

## File Structure

- `index.html` - Home page
- `portfolio.html` - Portfolio gallery with filtering
- `services.html` - Detailed services and pricing
- `about.html` - Company story, values, and team
- `contact.html` - Contact information and form
- `styles.css` - All styling and layout rules
- `script.js` - Interactive functionality (menu, animations, filtering)
