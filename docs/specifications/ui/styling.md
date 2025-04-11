# 🎨 CSS and Styling Guide

This document provides guidance on CSS and styling in the Reportly project, with a focus on Tailwind CSS configuration and best practices.

## 📋 Overview

Reportly uses Tailwind CSS as its primary styling solution. Tailwind CSS is a utility-first CSS framework that allows for rapid UI development through composable utility classes.

## 🔧 Tailwind CSS Configuration

### Version Compatibility

Reportly supports both Tailwind CSS v3 and v4:

- **Tailwind CSS v3**: The stable version used in production
- **Tailwind CSS v4**: The newer version with enhanced features (experimental support)

### Configuration Files

Two key configuration files control Tailwind CSS behavior:

1. **postcss.config.js**: Configures the PostCSS plugins
2. **tailwind.config.js**: Configures Tailwind CSS itself

#### For Tailwind CSS v3

**postcss.config.js**:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**tailwind.config.js**:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // rest of configuration...
}
```

#### For Tailwind CSS v4

**postcss.config.js**:
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**tailwind.config.js**:
```js
/** @type {import('@tailwindcss/postcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // rest of configuration...
}
```

### Required Dependencies

#### For Tailwind CSS v3
```bash
npm install tailwindcss@3 postcss@8 autoprefixer@10 --save-dev
```

#### For Tailwind CSS v4
```bash
npm install @tailwindcss/postcss@4 postcss@8 autoprefixer@10 --save-dev
```

## 🖌️ CSS Structure

### Global Styles

Global styles are defined in `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add any custom global styles here */

body {
  /* Example: Add default background color for light/dark mode */
  @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
}
```

### Component-Specific Styles

For component-specific styles, we use Tailwind's utility classes directly in the component JSX:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-semibold text-gray-800">Component Title</h2>
  <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Action
  </button>
</div>
```

## 🌙 Dark Mode

Reportly uses Tailwind's `dark` variant with the `class` strategy for dark mode support:

```jsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Dark mode compatible content
</div>
```

The dark mode class is toggled on the `<html>` element based on user preference.

## 🚫 Common Issues and Troubleshooting

### Tailwind CSS Plugin Error

**Error**: "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin."

**Solution**: This occurs when using Tailwind CSS v4 with an outdated configuration. Update your `postcss.config.js` to use `@tailwindcss/postcss` instead of `tailwindcss`.

### Unknown Utility Class Error

**Error**: "Cannot apply unknown utility class: [class-name]"

**Solution**: This may happen when there's a mismatch between Tailwind CSS versions. Ensure your configuration matches the installed version (v3 or v4).

### CSS Not Applying

**Issue**: Tailwind classes not being applied to elements

**Solutions**:
1. Check that the class names are spelled correctly
2. Verify that the element path is included in the `content` array in `tailwind.config.js`
3. Restart the development server
4. Clear the `.next` cache: `rm -rf .next`

## 🔄 Migrating Between Versions

### From v3 to v4

1. Install the new package: `npm install @tailwindcss/postcss@4 --save-dev`
2. Update `postcss.config.js` to use `@tailwindcss/postcss` instead of `tailwindcss`
3. Update `tailwind.config.js` to use `import('@tailwindcss/postcss').Config`
4. Review and update any custom plugins or configurations

### From v4 to v3

1. Install the v3 package: `npm install tailwindcss@3 --save-dev`
2. Update `postcss.config.js` to use `tailwindcss` instead of `@tailwindcss/postcss`
3. Update `tailwind.config.js` to use `import('tailwindcss').Config`

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostCSS Documentation](https://postcss.org/)
- [Next.js with Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
