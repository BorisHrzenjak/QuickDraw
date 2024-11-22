<a href="https://www.quickdraw.io">
  <img alt="QuickDraw" src="./public/og-image.png">
  <h1 align="center">QuickDraw</h1>
</a>

<p align="center">
  An open source real-time AI image generator with voice commands. Powered by Flux through Together.ai.
</p>

## Features

- 🎙️ Voice-to-Image: Generate images using voice commands
- 🖼️ Multiple Aspect Ratios: Choose between square, portrait, and landscape formats
- 🎨 Style Presets: Select from anime, photorealistic, or oil-painting styles
- 💾 Image Storage: Save and manage your favorite generations
- 🔄 Iterative Mode: Refine and improve your generations
- 🌐 Social Sharing: Share your creations on Twitter, Facebook, Instagram, and via email

## Tech stack

- [Flux Schnell](https://www.dub.sh/together-flux/) from BFL for the image model
- [Together AI](https://www.dub.sh/together-ai) for inference
- Next.js app router with Tailwind
- Helicone for observability
- Plausible for website analytics
- Firebase for image storage and management

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AI API Keys
TOGETHER_API_KEY=your_together_api_key_here
HELICONE_API_KEY=your_helicone_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env.local`
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Cloning & running

1. Clone the repo: `git clone https://github.com/BorisHernan/quickdraw`
2. Create a `.env.local` file and add your [Together AI API key](https://www.dub.sh/together-ai): `TOGETHER_API_KEY=`
3. Run `npm install` and `npm run dev` to install dependencies and run locally

## Future Tasks

- [ ] Show a download button so people can get their images
- [ ] Add auth and rate limit by email instead of IP
- [ ] Show people how many credits they have left
- [ ] Build an image gallery of cool generations w/ their prompts
- [ ] Add replay functionality so people can replay consistent generations
- [ ] Add a setting to select between steps (2-5)

## Authentication

This project uses [Clerk](https://clerk.dev/) for authentication. To set up authentication:

1. Sign up for a Clerk account and create a new application.
2. Copy your Clerk Publishable Key and Secret Key.
3. Create a `.env.local` file in the root of your project and add the following:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```

   Replace `your_publishable_key` and `your_secret_key` with your actual Clerk keys.

4. Install the Clerk package:

   ```
   npm install @clerk/nextjs
   ```

5. The `ClerkProvider` is already set up in `app/layout.tsx`, wrapping the entire application.

For more information on using Clerk with Next.js, refer to the [Clerk Next.js documentation](https://clerk.dev/docs/nextjs/get-started-with-nextjs).
