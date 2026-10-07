import { projectTech } from "@/data/tech";
import type { TechItem } from "@/data/tech";

export interface Project {
  name: string;
  imgSrc: string;
  description: string;
  techStack: TechItem[];
  liveLink: string;
  githubLink: string;
  about: string;
  features: string[];
}

export const projects: Project[] = [
  {
    name: "Self Healing Pipeline",
    imgSrc: "/projects/Self-healing-pipeline.png",
    description:
      "An agent that detects, diagnoses, and fixes broken dbt pipelines, then opens a Pull Request for review.",
    about:
      "This project is an agent that automatically fixes broken data pipelines caused by upstream schema changes. When a pipeline fails, the agent inspects the live database, reads the broken SQL model, and rewrites the code to reconcile the mismatch. It then runs real dbt tests in a loop until they pass, empirically verifying the fix before stopping. Finally, it commits the working code to an isolated branch and opens a Pull Request for a human to review.",
    features: [
      "The Self-Healing Loop: The agent reasons in a cycle: it inspects the live database, reads the broken SQL, rewrites the code, and runs dbt tests until they pass.",
      "Human-in-the-Loop GitOps: Agent never pushes directly to production. It commits the fix to an isolated Git branch and opens a PR, keeping humans in control. ",
      "Bounded & Safe by Design: Agent doesn't run free-form shell commands. It operates through strict, auditable Python functions—it can edit model files and push branches, but cannot alter the core database schema.",
      "One-Click Reproducible Demo: A single script (demo.py) spins up the environment, generates mock data, breaks the schema on purpose, and triggers the AI to fix it—resetting perfectly every time.",
      "Swappable Brains: Connects to any OpenAI-compatible API (OpenAI, Groq, Zhipu AI) without needing to rewrite the tooling code.",
    ],
    techStack: [
      projectTech.python,
      projectTech.postgresql,
      projectTech.dbt,
      projectTech.apacheairflow,
      projectTech.langgraph,
      projectTech.mistral,
      projectTech.docker,
    ],
    liveLink: "https://",
    githubLink: "https://github.com/voidd-sam/self-healing-pipeline",
  },
  {
    name: "Llm Gateway",
    imgSrc: "/projects/llm-gateway.png",
    description:
      "API gateway middleware that routes requests by complexity, serves duplicates from a semantic cache, and redacts PII before transmission.",
    about:
      "This project is API middleware that sits between client applications and external model providers. It intercepts requests to redact personally identifiable information and block injection attacks. It then checks a semantic cache; if a similar vector match is found, it returns the cached response instantly without calling the provider. If no match exists, it classifies the prompt's complexity and routes it to the appropriate model to optimize cost and speed. All token usage, cache hits, and latency are tracked in real-time via Prometheus and Grafana.",
    features: [
      "Dynamic Model Routing: Classifies prompt complexity and routes simple queries to cheap/fast models (open-mistral-7b), reserving expensive models (mistral-large-latest) for complex reasoning tasks.",
      "Semantic Caching: Utilizes Redis and vector embeddings to cache responses. If a similar prompt (cosine similarity > 85%) is received, the gateway returns the cached response instantly, bypassing the LLM entirely.",
      "Security & Guardrails: Intercepts prompts to redact Personally Identifiable Information (PII) using Regex and blocks adversarial prompt injection attacks before they reach external servers.",
      "Observability: Tracks token usage, cost, cache hits, and latency per request in real-time using Prometheus, visualized in a live Grafana dashboard.",
    ],
    techStack: [
      projectTech.python,
      projectTech.mistral,
      projectTech.fastapi,
      projectTech.numpy,
      projectTech.redis,
      projectTech.prometheus,
      projectTech.graphana,
      projectTech.docker,
    ],
    liveLink: "https://github.com/voidd-sam/llm-gateway",
    githubLink: "https://github.com/voidd-sam/llm-gateway",
  },
  {
    name: "Anomaly Engine",
    imgSrc: "/projects/anomaly-engine.png",
    description:
      "An event driven streaming pipeline that scores live user behavior in milliseconds and dispatches an automated language model to investigate flagged anomalies.",
    about:
      "This project is a streaming pipeline that monitors live user behavior to detect anomaly and system glitches. It ingests clickstream data via Apache Kafka and scores it using an unsupervised machine learning model (Isolation Forest) in real time. When an anomaly is flagged, an automated language model is triggered to analyze the payload, determine the threat level, and generate a structured forensic report. The entire stack runs locally in Docker and streams results to a WebSocket-powered dashboard.",
    features: [
      
      "Real-Time Streaming: Simulates 1,000+ live user events per second using Apache Kafka in KRaft mode, removing the need for Zookeeper.",
      "Unsupervised ML Detection: Uses scikit-learn's Isolation Forest to profile user behavior and assign real-time anomaly scores without labeled training data.",
      "Automated Triage: When an anomaly is flagged, a language model analyzes the payload, distinguishes between true threats (e.g., bots) and false positives (e.g., slow humans), and generates a structured JSON report.",
      "Live SOC Dashboard: A dark-themed, WebSocket-powered FastAPI frontend that displays forensic reports in real time as events are scored.",
    
    ],
    techStack: [
      projectTech.python,
      projectTech.apachekafka,
      projectTech.scikitlearn,
      projectTech.langchain,
      projectTech.groq,
      projectTech.fastapi,
      projectTech.websocket,
      projectTech.docker,
    ],
    liveLink: "https://github.com/voidd-sam/anomaly-engine",
    githubLink: "https://github.com/voidd-sam/anomaly-engine",
  },
  {
    name: "Ly-ric",
    imgSrc: "/projects/ly-ric.png",
    description:
      "A simple terminal (TUI) music player ",
    about:
      "A terminal-based YouTube Music player with synced lyrics, radio-style autoplay and vim-style controls. Built with Python, mpv and YouTube Music's recommendation engine.",
    features: [
      "Search YouTube Music (songs only — no random videos)",
      "Stream audio via mpv (audio-only, lightweight)",
      "Synced lyrics (falls back to plain lyrics)",
      "Radio queue: auto-plays related songs (same/other artists, remixes)",
      "Next / previous / replay / seek / pause controls",
      "Full-screen terminal UI",
    ],
    techStack: [
      projectTech.python,
      projectTech.mpv,
      projectTech.ytmusic,
      
    ],
    liveLink: "https://github.com/voidd-sam/lyric",
    githubLink: "https://github.com/voidd-sam/ly-ric",
  },
  {
    name: "Glass Minimal Hyprland",
    imgSrc: "/projects/gm-hyprland.png",
    description:
      "A complete hyprland desktop configuration featuring a unified color palette, glassmorphism effects, and pre-configured core utilities.",
    about:
          "This project is a modular dotfiles repository for the Hyprland Wayland compositor. It provides a complete desktop environment configuration that can be copied directly into a user's .config directory. It bundles pre-configured components—including Waybar, Kitty, Rofi, and Dunst—unified under a consistent color palette and glassmorphism aesthetic. The setup is designed for Arch-based systems and includes an automated install script to immediately apply the environment.",
        features: [
      "Unified Aesthetic: Applies a consistent color palette and glassmorphism effects, such as blurred bars and translucent panels, across all desktop components.",
      "Pre-configured Utilities: Bundles ready-to-use setups for Waybar, Kitty, Rofi, Dunst, Hyprlock, and a custom btop system monitor theme.",
      "Modular Structure: Configurations are organized into logical directories and heavily commented, making it easy to tweak keybinds, animations, and bar modules.",
      "One-Command Install: Includes an automated setup script tailored for Arch-based Linux distributions to apply the entire configuration in one step.",
    ],    

    techStack: [
      projectTech.lua,
      projectTech.toml,
      projectTech.hyprland,
      ],
    liveLink: "https://github.com/voidd-sam/glass-minimal-hyprland",
    githubLink: "https://github.com/voidd-sam/glass-minimal-hyprland",
  },
];

// End of projects data
