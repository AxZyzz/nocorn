# Waitlist UI - React Component Integration

A beautiful waitlist landing page with countdown timer built with Next.js, TypeScript, Tailwind CSS, and Three.js.

## Features

- **Modern React Component**: Built with TypeScript and React hooks
- **3D Background Effects**: Stunning Three.js animated background with gradient light streaks
- **Responsive Design**: Fully responsive design with Tailwind CSS
- **Countdown Timer**: Real-time countdown timer with days, hours, minutes, and seconds
- **Email Collection**: Form to collect email addresses for the waitlist
- **Success State**: Beautiful success message after form submission
- **shadcn/ui Compatible**: Uses shadcn/ui design system and component structure

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind CSS
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page using WaitlistExperience
│   └── demo/
│       └── page.tsx         # Demo page
├── components/
│   └── ui/
│       └── waitlist-landing-page-with-countdown-timer.tsx
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

### Dependencies

- **React 18**: Modern React with hooks
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js**: 3D graphics library for background effects

## Component Usage

### Basic Usage

```tsx
import { WaitlistExperience } from "@/components/ui/waitlist-landing-page-with-countdown-timer";

export default function MyPage() {
  return <WaitlistExperience />;
}
```

### Component Features

- **Email Form**: Collects email addresses with validation
- **Countdown Timer**: Displays time remaining until launch
- **3D Background**: Animated gradient light streaks using Three.js shaders
- **Navigation Bar**: Top navigation with feature tabs
- **Success State**: Shows confirmation after email submission

## Customization

### Styling
The component uses Tailwind CSS classes and can be customized by:
- Modifying the color scheme in `tailwind.config.ts`
- Updating CSS custom properties in `globals.css`
- Changing component styles directly in the TSX file

### Countdown Timer
Update the initial countdown values in the component:
```tsx
const [timeLeft, setTimeLeft] = useState({
  days: 225,
  hours: 23,
  minutes: 17,
  seconds: 58,
})
```

### Three.js Background
The background effect can be customized by modifying:
- Shader colors in the fragment shader
- Curve geometry for different light paths
- Animation parameters for different effects

## Why /components/ui Folder?

The `/components/ui` folder structure is important because:

1. **shadcn/ui Convention**: This is the standard path used by shadcn/ui components
2. **Import Consistency**: Allows for consistent imports like `@/components/ui/component-name`
3. **Component Organization**: Separates UI components from other types of components
4. **Tool Compatibility**: Many tools and generators expect this structure
5. **Community Standard**: Widely adopted pattern in the React/Next.js community

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Note: Three.js requires WebGL support for the background effects.
