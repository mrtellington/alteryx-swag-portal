# CognitoForms with ServiceNow Sans Font Setup

## Overview
This setup provides a React component for embedding CognitoForms with ServiceNow Sans font support, falling back to Gilroy and then system fonts.

## Font Setup

### 1. Font Files
Place your ServiceNow Sans font files in the `public/fonts/` directory:

```
public/fonts/
├── ServiceNowSans-Regular.woff2
├── ServiceNowSans-Regular.woff
├── ServiceNowSans-Medium.woff2
├── ServiceNowSans-Medium.woff
├── ServiceNowSans-Bold.woff2
└── ServiceNowSans-Bold.woff
```

### 2. Gilroy Font Files (Fallback)
If you have Gilroy font files, also place them in the same directory:

```
public/fonts/
├── Gilroy-Regular.woff2
├── Gilroy-Regular.woff
├── Gilroy-Medium.woff2
├── Gilroy-Medium.woff
├── Gilroy-Bold.woff2
└── Gilroy-Bold.woff
```

## Usage

### Using the React Component
```tsx
import CognitoForm from '@/components/CognitoForm';

// In your component/page
<CognitoForm 
  formId="2vvHPVG_yEWBEZ50OKCZiQ/54"
  height={773}
  className="my-custom-class"
/>
```

### Using the Original HTML (Updated)
If you prefer to use the original HTML approach, here's the updated code:

```html
<div class="cognito-form-container">
  <iframe 
    src="https://www.cognitoforms.com/f/2vvHPVG_yEWBEZ50OKCZiQ/54" 
    allow="payment" 
    style="border:0;width:100%;font-family: var(--font-servicenow);" 
    height="773">
  </iframe>
</div>
<script src="https://www.cognitoforms.com/f/iframe.js"></script>
```

## Font Fallback Chain
The font will load in this order:
1. **ServiceNow Sans** (if available on user's system or loaded via CSS)
2. **Gilroy** (fallback if ServiceNow Sans is not available)
3. **System fonts** (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)

## CSS Variables
The font stack is defined in CSS variables:
```css
--font-servicenow: 'ServiceNow Sans', 'Gilroy', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

## Notes
- The component automatically loads the CognitoForms iframe script
- Font files should be in WOFF2 format for best performance, with WOFF as fallback
- The `font-display: swap` property ensures text remains visible during font loading
- If ServiceNow Sans is not available on the user's system, it will automatically fall back to Gilroy, then system fonts

## Troubleshooting
1. **Fonts not loading**: Check that font files are in the correct `public/fonts/` directory
2. **Iframe not styled**: Ensure the `cognito-form-container` class is applied to the wrapper div
3. **Script loading issues**: The React component handles script loading automatically