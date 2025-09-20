# NO-CORN Waitlist Landing Page

A beautiful, modern waitlist landing page for NO-CORN - your gamified porn blocker and wellness tracker.

## ✨ Features

- **Stunning 3D Background**: Three.js powered animated light streaks
- **Real-time Timer**: Shows elapsed time since launch preparation
- **Supabase Integration**: Secure email collection with duplicate prevention
- **Discord Integration**: Direct link to community server
- **Dynamic Counter**: Shows growing number of signups starting from 72
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Acrylic glass effects and smooth animations

## 🚀 Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Three.js** for 3D effects
- **Supabase** for database
- **Netlify** for deployment

## 🛠️ Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AxZyzz/nocorn.git
   cd nocorn
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

## 📦 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Build settings are automatically configured via `netlify.toml`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Manual Build

```bash
npm run build
```

The static files will be generated in the `out/` directory.

## 🗄️ Database Schema

The app uses a simple `waitlist` table in Supabase:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 Customization

- **Timer Start Date**: Update `startTimeRef` in the component
- **Discord Link**: Update the Discord URL in both button handlers
- **Styling**: Modify Tailwind classes for different themes
- **3D Effects**: Adjust Three.js parameters for different animations

## 📧 Contact

For questions or support, join our [Discord community](https://discord.gg/uUpeXN3A2j).

---

Built with ❤️ for the NO-CORN community
