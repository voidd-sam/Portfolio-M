export interface TechItem {
  name: string;
  icon: string;
  darkIcon?: string;
}

export const skills: TechItem[] = [
  { name: "Python", icon: "/tech/python.svg" },
  { name: "Lang Graph", icon: "/tech/langgraph.svg" },
  { name: "Tableau", icon: "tech/tableau.svg" },
  { name: "Lang Chain", icon: "/tech/langchain.svg" },
  { name: "Apache Airflow", icon: "/tech/airflow.svg" },
  { name: "LLM", icon: "/tech/vllm.svg" },
  { name: "DBT", icon: "/tech/dbt.svg" },
  { name: "Duck DB", icon: "/tech/duckdb.svg" },
];

export const frontendSkills: TechItem[] = [
  { name: "Python", icon: "/tech/python.svg" },
  { name: "ML", icon: "/tech/machine-learning.svg" },
  { name: "C", icon: "/tech/c.svg" },
  { name: "Lua", icon: "/tech/lua.svg" },
  { name: "Java Script", icon: "/tech/javascript.svg" },
  { name: "Linux", icon: "/tech/linux.svg",},
  { name: "Bash", icon: "/tech/bash.svg" },
  { name: "SQL", icon: "/tech/sqllite.svg" },
  { name: "GO", icon: "/tech/go.svg",},
  { name: "Numpy", icon: "/tech/numpy.svg" },
  { name: "Pandas", icon: "/tech/pandas.svg" },
  { name: "Matplotlib", icon: "/tech/matplotlib.svg" },
  { name: "Scikit Learn", icon: "/tech/scikit-learn.svg" },




];

export const backendSkills: TechItem[] = [
  { name: "PostgreSQL", icon: "/tech/postgre.svg" },
  { name: "Apache Kafka", icon: "/tech/apache-kafka.svg" },
  { name: "MySQL", icon: "/tech/mysql.svg" },
  { name: "DBT", icon: "/tech/dbt.svg" },
  { name: "Apache Airflow", icon: "/tech/airflow.svg" },
  { name: "Redis", icon: "/tech/redis.svg" },
  { name: "Duck DB", icon: "/tech/duckdb.svg" },
  { name: "Fast API", icon: "/tech/fastapi.svg" },
  { name: "Web Socket", icon: "/tech/WebSocket.svg" },
  { name: "Grafana", icon: "/tech/grafana.svg" },
  { name: "Prometheus", icon: "/tech/prometheus.svg" },


];

export const toolsSkills: TechItem[] = [
  { name: "Git", icon: "/tech/git.svg" },
  { name: "Arch", icon: "/tech/arch-linux.svg" },
  { name: "Tableau", icon: "tech/tableau.svg" },
  {
    name: "GitHub",
    icon: "/social/github.svg",
    darkIcon: "/social/github-dark.svg",
  },
  { name: "Docker", icon: "/tech/docker.svg" },
  
];

export const skillRows: { direction: "left" | "right"; category: string; items: TechItem[] }[] = [
  {
    direction: "left",
    category: "Frontend",
    items: frontendSkills,
  },
  {
    direction: "right",
    category: "Backend",
    items: backendSkills,
  },
  {
    direction: "left",
    category: "Tools & DevOps",
    items: toolsSkills,
  },
];

export const projectTech = {
  rust: { name: "Rust", icon: "/tech/rust.svg" },
  react: { name: "React", icon: "/tech/react.svg" },
  javascript: { name: "JavaScript", icon: "/tech/js.svg" },
  typescript: { name: "TypeScript", icon: "/tech/typescript.svg" },
  tailwindcss: { name: "Tailwind CSS", icon: "/tech/tailwindcss.svg" },
  vite: { name: "Vite", icon: "/tech/vite.svg" },
  motion: { name: "Framer Motion", icon: "/tech/motion.svg" },
  springboot: { name: "Spring Boot", icon: "/tech/springboot.svg" },
  python: { name: "Python", icon: "/tech/python.svg" },
  langgraph: { name: "Lange Graph", icon: "/tech/langgraph.svg" },
  langchain: { name: "Lange Chain", icon: "/tech/langchain.svg" },
  ml: { name: "ML", icon: "/tech/machine-learning.svg" },
  apacheairflow: { name: "Apache Airflow", icon: "/tech/airflow.svg" },
  apachekafka: { name: "Apache Kafka", icon: "/tech/apache-kafka.svg" },
  llm: { name: "LLM", icon: "/tech/vllm.svg" },
  groq: {name: "Groq", icon: "/tech/groq.svg"},
  dbt: { name: "DBT", icon: "/tech/dbt.svg" },
  duckdb: { name: "Duck DB", icon: "/tech/duckdb.svg" },
  c: { name: "C", icon: "/tech/c.svg" },
  lua: { name: "Lua", icon: "/tech/lua.svg" },
  linux: { name: "Linux", icon: "/tech/linux.svg",},
  bash: { name: "Bash", icon: "/tech/bash.svg" },
  sql: { name: "SQL", icon: "/tech/sqllite.svg" },
  go: { name: "GO", icon: "/tech/go.svg",},
  numpy: { name: "Numpy", icon: "/tech/numpy.svg" },
  pandas: { name: "Pandas", icon: "/tech/pandas.svg" },
  matplotlib: { name: "Matplotlib", icon: "/tech/matplotlib.svg" },
  scikitlearn: { name: "Scikit Learn", icon: "/tech/scikit-learn.svg" },
  fastapi: { name: "Fast API", icon: "/tech/fastapi.svg" },
  websocket: { name: "Web Socket", icon: "/tech/WebSocket.svg" },
  graphana: { name: "Grafana", icon: "/tech/grafana.svg" },
  prometheus: { name: "Prometheus", icon: "/tech/prometheus.svg" },
  git: { name: "Git", icon: "/tech/git.svg" },
  mpv: {name: "MPV", icon: "/tech/mpv.svg"},
  ytmusic: {name: "YT-Music", icon: "/tech/youtube-music.svg" },
  neovim: {name: "NeoVim", icon: "/tech/neovim.svg" },
  hyprland: {name: "Hyprland", icon: "/tech/hyprland.svg" },
  toml: {name: "Toml", icon: "/tech/toml.svg" },
  github: {
    name: "GitHub",
    icon: "/social/github.svg",
    darkIcon: "/social/github-dark.svg",
  },

  radixui: {
    name: "Radix UI",
    icon: "/tech/radixui.svg",
    darkIcon: "/tech/radixui-dark.svg",
  },
  shadcnui: {
    name: "shadcn/ui",
    icon: "/tech/shadcn-ui-light.svg",
    darkIcon: "/tech/shadcn-ui-dark.svg",
  },
  gtk4: { name: "GTK4", icon: "/tech/gtk4.svg" },
  libadwaita: { name: "libadwaita", icon: "/tech/libadwaita.svg" },
  sqlite: { name: "SQLite", icon: "/tech/sqlite.svg" },
  supabase: { name: "Supabase", icon: "/tech/supabase.svg" },
  postgresql: { name: "PostgreSQL", icon: "/tech/postgre.svg" },
  redis: { name: "Redis", icon: "/tech/redis.svg" },
  jwt: {
    name: "JWT",
    icon: "/tech/jwt-light.svg",
    darkIcon: "/tech/jwt-dark.svg",
  },
  monaco: { name: "Monaco Editor", icon: "/tech/monaco.svg" },
  nodejs: {
    name: "Node.js",
    icon: "/tech/nodejs-light.svg",
    darkIcon: "/tech/nodejs-dark.svg",
  },
  ink: {
    name: "Ink",
    icon: "/tech/ink-light.svg",
    darkIcon: "/tech/ink-dark.svg",
  },
  commander: {
    name: "Commander.js",
    icon: "/tech/commander-light.svg",
    darkIcon: "/tech/commander-dark.svg",
  },
  execa: {
    name: "Execa",
    icon: "/tech/execa-light.svg",
    darkIcon: "/tech/execa-dark.svg",
  },
  docker: { name: "Docker", icon: "/tech/docker.svg" },
} as const;
