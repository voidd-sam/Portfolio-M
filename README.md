<div align="center">

# Portfolio

A modern personal portfolio built with React, Vite, and TypeScript. This project features a floating liquid-glass navbar, dynamic GitHub activity tracking via secure serverless APIs, and a blog section.
</div>


**Live at:** [sameer-khan.xyz](https://sameer-khan.xyz)

---

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Animations:** motion/react
- **Routing:** React Router
- **Backend:** Vercel Serverless Functions (Node.js)
- **Hosting:** Vercel

---

## Features

- **Frosted Glass navbar:** A floating, frosted-glass navbar with custom glass effects and dashed borders.
- **Dynamic GitHub Integration:** A live GitHub contribution graph powered by a secure backend API to bypass rate limits.
- **Custom Typography:** Uses the "Amsterdam Handwriting" font for name in the navbar.
- **Theme Support:** System, Light, and Dark mode support via `next-themes`.
- **Responsive Design:** Mobile-first approach with an adaptive pill-shaped mobile menu.
- **Blog & Projects System:** Data-driven pages for projects and blogs, supporting dynamic routing and detail pages.

---

## Local Development

This project requires both the frontend and a local backend server (for the GitHub API) to run simultaneously for full functionality.(Altho you can skip this because github let you fetch data about 60 times/hour)

### Prerequisites

- Node.js and npm
- Vercel CLI (installed globally)
  ```bash
  npm install -g vercel
  ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sam-k99/Portfolio-M.git
   cd Portfolio-M
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```

### Running the Application

You will need two terminal windows.

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend API):**
```bash
vercel dev --listen 3000
```

Visit `http://localhost:5173` to view the application.

---

## Environment Variables

To run the GitHub activity API locally, you will need the following environment variables in your `.env` file:

| Variable | Description |
| :--- | :--- |
| `GITHUB_TOKEN` | A GitHub Personal Access Token used to increase API rate limits from 60 to 5,000 requests/hour. |

---

## Deployment

This project is configured for seamless deployment on Vercel. 

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Vercel will automatically detect the Vite framework.
4. Add your `GITHUB_TOKEN` to the Environment Variables in the Vercel project settings.
5. Deploy. Vercel will automatically build the frontend and the serverless functions in the `api/` directory.

---

## Project Structure

```
├── api/                # Backend serverless functions (GitHub API)
├── public/             # Static assets (images, fonts, icons)
├── src/
│   ├── components/     # Reusable UI components (Navbar, Footer, Cards)
│   ├── data/           # Centralized data files (Projects, Blogs, Tech)
│   ├── pages/          # Route pages (Projects, Blogs, Contact)
│   ├── lib/            # Helper functions and utilities
│   └── index.css       # Global styles and Tailwind configuration
├── index.html          # HTML entry point
└── vite.config.ts      # Vite and proxy configuration
```

---



###### Credit- [/CharanMunur](https://github.com/CharanMunur/Portfolio)


<div align="center">

  <sub> 
    Thanks for stoping by. 
  </sub>
</div>
Testing GitHub Graph
Testing GitHub Graph
