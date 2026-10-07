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
    name: "Self-healing-pipeline",
    imgSrc: "/projects/Self-healing-pipeline.png",
    description:
      "A self healing pipeline which heals on its own on every anomy ..find it analyze it fix it ....push it ",
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
    name: "Llm-gateway",
    imgSrc: "/projects/llm-gateway.png",
    description:
      "High-throughput API middleware for LLMs with dynamic routing, semantic caching, and security guardrails",
    about:
      "The LLM Gateway is a high-throughput, production-grade API middleware designed to sit between client applications and Large Language Model (LLM) providers.",
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
      "Real-time streaming pipeline using Kafka, Isolation Forest ML, and LLM Agents for autonomous bot detection and triage",
    about:
      "The Autonomous Anomaly Engine is an event-driven streaming pipeline that monitors live user behavior to detect fraud, bots, and system glitches in milliseconds.",
    features: [
      "Real-Time Streaming: Simulates 1,000+ live user events per second using Apache Kafka (KRaft mode).",
      "Unsupervised ML Detection: Uses scikit-learn's Isolation Forest to profile user behavior and assign real-time anomaly scores without labeled data.",
      "Autonomous AI Investigator: When an anomaly is flagged, an LLM Agent (Groq/Llama 3.1) is triggered. It analyzes the payload, determines the threat level (Bot vs. Slow Human), and generates a structured JSON forensic report.",
      "Live SOC Dashboard: A dark-themed, WebSocket-powered FastAPI frontend where AI forensic reports pop up in real-time.",
      "Fully Containerized: The entire stack (Kafka, ML Model, AI Agent, API) spins up with a single docker-compose up command.",

    ],
    techStack: [
      projectTech.python,
      projectTech.apachekafka,
      projectTech.scikitlearn,
      projectTech.langchain,
      projectTech.groq,
      projectTech.fastapi,
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
      "A full hyprland desktop setup.",
    about:
      "Glass is a complete, ready-to-rice Hyprland configuration. It combines subtle glassmorphism, smooth animations, and a minimal aesthetic everything you need for a distraction-free yet beautiful workflow, straight out of the box.",
    features: [
      "Minimal & lightweight — no bloat, only what matters",
      "Glassmorphism everywhere — blurred bars, translucent panels",
      "Due date picker with date-grouped task views",
      "Coherent color palette across every single app",
      "Smooth animations & transitions — buttery window movement",
      "Dark and light theme toggle with persistent preference",
      "Beautiful btop skin included",
      "One-command install script — Arch-based ready", 
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
