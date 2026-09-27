export interface Blog {
  title: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
  readTime: string;
  pinned?: boolean;
}

export const blogs: Blog[] = [
  {
    title: "Building a Self-Healing Data Pipeline",
    description:
      "Analytics pipelines fail in boring, predictable ways. Here is how I built an autonomous AI agent that detects schema drift, rewrites broken SQL, runs dbt tests, and opens a pull request automatically.",
    tags: ["Data Engineering", "AI Agents", "LangGraph", "dbt", "Python"],
    date: "2026-08-22",
    readTime: "12 min read",
    pinned: true,
    content: `Analytics pipelines fail in boring, predictable ways. A source system renames a column. An API adds a required field. An upstream team ships a "small cleanup" on a Friday afternoon. The dbt model downstream still references the old name, the nightly run turns red, and a human gets paged to perform the same four-step dance they have done a hundred times: read the error, check the schema, patch the SQL, rerun the tests.

This project asks a simple question: if the remediation loop is that mechanical, why is a human still in it?

This is a local, fully reproducible demonstration of autonomous data-ops. It pairs a real analytics stack (PostgreSQL, dbt, Airflow) with a LangGraph ReAct agent equipped with tools to inspect the live database, read and rewrite model files, and execute the dbt test suite. A saboteur script deliberately introduces upstream schema drift; the agent diagnoses the failure, repairs the model, empirically verifies the fix, and delivers it through a standard GitOps workflow.

---

## The Problem: Schema Drift

Schema drift is the routine failure mode of every analytics stack that consumes external systems. Today, the standard response looks like this:

| Stage | Traditional Response | This Project |
| --- | --- | --- |
| Detection | An engineer notices a failed run | The pipeline failure triggers the agent |
| Diagnosis | Manual: read logs, query the schema | The agent queries the live schema itself |
| Fix | Hand-edited SQL | The agent rewrites the model SQL |
| Verification | Rerun the job and hope | The agent runs dbt tests in a loop until green |
| Delivery | Manually opened PR | The agent opens the PR; a human merges it |

The goal is not to remove humans from the loop. It is to remove humans from the *tedium* of the loop, and to keep them exactly where judgment belongs: reviewing the diff.

---

## Architecture Overview

The system relies on a set of isolated Docker containers and a Python-based agent. The agent talks to any OpenAI-compatible endpoint, so the reasoning engine is swappable without touching the tool layer.

\`\`\`mermaid
flowchart LR
    DG["data_generator.py<br/>(Faker)"] --> PG[("PostgreSQL<br/>raw_orders")]
    SB["schema_breaker.py"] -. "renames a column" .-> PG
    PG --> ST["stg_orders.sql"]
    ST --> MR["mart_revenue.sql"]
    AG["LangGraph ReAct agent"] --> PG
    AG --> ST
    AG --> GIT["Git branch + pull request"]
\`\`\`

| Component | Role |
| --- | --- |
| PostgreSQL (Docker) | The warehouse holding raw data and dbt-built models |
| dbt | The transformation layer: staging and marts models with tests |
| Airflow (Docker) | The orchestration plane; the custom image includes dbt |
| \`schema_breaker.py\` | The saboteur: simulates upstream schema drift |
| \`agent_tools.py\` | The tool layer between the LLM and the system |
| \`agent.py\` | LangGraph ReAct agent initialization and the repair loop |

---

## Step 1: Setting Up the Infrastructure

The first step is getting a working environment. A Docker Compose file spins up PostgreSQL and Airflow. A custom Dockerfile builds an Airflow image with dbt and the right Python dependencies baked in, so nothing touches the host machine directly.

The PostgreSQL initialization script creates the \`raw_orders\` table:

\`\`\`sql
CREATE TABLE raw_orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR,
    order_date DATE,
    order_amount NUMERIC,
    order_status VARCHAR
);
\`\`\`

A Python script built on the Faker library generates realistic mock e-commerce records and loads them into this raw table.

---

## Step 2: The dbt Transformation Layer

On top of the raw data sit two dbt models:
1. A **staging model** (\`stg_orders.sql\`) that selects from the raw table.
2. A **mart model** (\`mart_revenue.sql\`) that aggregates daily revenue.

Along with these models are standard dbt tests checking that order IDs are unique and non-null.

The dbt profile is configured to point at the local Docker container:

\`\`\`yaml
dbt_project:
  outputs:
    dev:
      type: postgres
      host: localhost
      user: admin
      password: your_secure_password
      port: 5432
      dbname: my_db
      schema: public
      threads: 1
  target: dev
\`\`\`

At this point, the pipeline is healthy. Running \`dbt run\` followed by \`dbt test\` succeeds without errors.

---

## Step 3: Breaking the Pipeline on Purpose

To test a self-healing system, you need something to actually break. I wrote a script called \`schema_breaker.py\`. It connects to Postgres and executes an \`ALTER TABLE\` statement to randomly mutate the schema: renaming a column, changing a type, or dropping a column outright.

\`\`\`sql
ALTER TABLE raw_orders RENAME COLUMN order_amount TO total_amount;
\`\`\`

Once it runs, the dbt models fail immediately, because the SQL is still written for the schema that no longer exists. The error output is explicit:

\`\`\`text
Database Error: column "order_amount" does not exist
\`\`\`

---

## Step 4: Giving the Agent Hands (The Toolkit)

An LLM by itself is just a brain that outputs text. It cannot touch a database or edit a file on its own. It needs tools to act through. I wrote a Python module giving the agent five narrow, auditable capabilities:

| Capability | What it does |
| --- | --- |
| Inspect the live schema | Queries the database catalog so the agent sees what columns exist now |
| Read a model file | Loads a model's \`.sql\` from disk into the agent's context |
| Write a model file | Persists the agent's rewritten SQL to disk |
| Run dbt tests | Executes the dbt suite and returns the raw output |
| Git operations | Branch, commit, and push the verified fix |

Because all reach flows through these functions, the blast radius is bounded. The agent can touch model files and feature branches, but the database schema itself and the \`main\` branch remain off-limits.

---

## Step 5: The Brain (LangGraph ReAct Loop)

For the reasoning loop, I used LangGraph to build a ReAct-style agent. Standard LLM chains are linear and cannot recover from their own mistakes. Data engineering fixes are inherently iterative. LangGraph lets the agent loop.

When the pipeline breaks, the agent is invoked with the dbt error output and cycles through four stages:

\`\`\`mermaid
flowchart TD
    A["dbt run fails"] --> B["Agent invoked with error output"]
    B --> C["1. Inspect<br/>query the live schema"]
    C --> D["2. Read<br/>load the failing .sql model"]
    D --> E["3. Write<br/>rewrite the SQL"]
    E --> F["4. Test<br/>run dbt test"]
    F -->|failure| C
    F -->|pass| G["GitOps stage<br/>branch, commit, push"]
    G --> H["Pull request<br/>human review"]
\`\`\`

1. **Inspect:** The agent reads the failing dbt run's error output and queries the live database catalog. It grounds its diagnosis in real schema state rather than in the error message alone.
2. **Read:** The agent loads the failing \`.sql\` file from the local filesystem to understand what the model expects.
3. **Write:** The agent rewrites the SQL to reconcile the mismatch (e.g., \`SELECT total_amount AS order_amount\`).
4. **Test:** The agent runs \`dbt test\` against the change. A failure sends the agent back to Inspect; a pass moves the workflow forward.

Once tests pass, the GitOps stage takes over: the agent creates an isolated branch, commits the verified fix, pushes it, and opens a Pull Request for human review.

---

## The Execution: A Sample Agent Session

When the \`demo.py\` script runs, it resets the environment, generates data, runs dbt, sabotages the schema, and triggers the AI agent. The terminal output looks like this:

\`\`\`text
[5/6] Sabotaging schema ...
      ALTER TABLE raw_orders RENAME COLUMN order_amount TO total_amount
      dbt run ... FAIL: column "order_amount" does not exist

[6/6] Invoking agent ...

  [agent] The dbt error says column "order_amount" does not exist in
           raw_orders. I will inspect the live schema to confirm what
           columns exist now.

  [tool]   inspect_schema("raw_orders")
           -> id, customer_name, order_date, total_amount, order_status

  [agent] The column was renamed from order_amount to total_amount
           upstream. Downstream models expect order_amount, so I will
           alias it back to keep the contract stable.

  [tool]   write_model_file("stg_orders.sql",
             "SELECT ..., total_amount AS order_amount, ...")

  [tool]   run_dbt_tests()
           -> PASS: all tests green

  [agent] All tests pass. Creating branch
           agent-fix/stg_orders-20250114-093112, committing the fix,
           and pushing it for review.

[done] Fix delivered via pull request.
\`\`\`

The agent converges on the minimal fix, verifies it empirically, and delivers it safely.

---

## Engineering Decisions

**LangGraph for cyclical logic.** LangGraph lets the agent loop. If \`run_dbt_tests\` fails, the agent reads the new error, returns to the rewrite phase, and tries again until it converges on a working fix.

**Idempotent infrastructure.** The demo script runs \`docker compose down -v\` to fully wipe the database volume on every execution. This guarantees zero state drift between runs, so the saboteur always breaks a known-clean schema and every demo run is reproducible.

**Human-in-the-loop (HITL).** The agent never pushes directly to \`main\`. It commits to an isolated branch and opens a Pull Request instead. A human always reviews the agent's reasoning and diff before it can affect production data.

**A real stack, not a simulation.** The agent's tools issue genuine dbt commands, real SQL queries, and real Git operations. Nothing about the failure or the fix is role-played. The schema is actually broken, and the tests actually pass at the end.

  Thanks for stoping by.
`,
  },

  
  {
    title: "LLM Gateway - Documentation",
    description:
      "Every company is building AI apps right now, but they are bleeding money on API costs and risking data leaks. Here's how to build a gateway that secures, caches, and routes prompts to the cheapest model.",
    tags: ["LLM", "FastAPI", "Docker", "Gateway"],
    date: "2026-08-16",
    readTime: "4 min read",
    content: `Every company is building AI apps right now, but they are bleeding money on API costs and risking data leaks. When you send a prompt to a large language model provider, you pay per token. If a user asks a simple question like what is two plus two, you still pay the full price. Worse, a user might type their social security number into the prompt, sending private data to a third party server.

The solution is an LLM Gateway. It is a middleman API that sits between your application and the LLM provider. It intercepts every prompt, secures it, caches it, and routes it to the cheapest possible model.

## How to Build It

### Step 1: The Core API Setup

First, create a folder for your project and set up a Python virtual environment. Install FastAPI, Uvicorn, and the OpenAI Python library. We will use the OpenAI library but point it to Mistral AI. Mistral has a generous free tier and is fully compatible with the OpenAI code format.

Create a file named main.py. You need to create a FastAPI application with a chat completions endpoint. This endpoint must accept the exact same JSON format that OpenAI uses. This way, any application built for OpenAI can just change its URL and use your gateway instead.

Inside your code, initialize the OpenAI client but set the base URL to the Mistral API. Load your Mistral API key from an environment file so it stays secret. When the endpoint receives a request, pass it directly to the Mistral client and return the response.

### Step 2: Dynamic Model Routing

Right now, every prompt goes to the same model. To save money, you need to classify the prompt. If it is a simple greeting, route it to a cheap fast model. If it is a complex coding request, route it to an expensive smart model.

Create a function that looks at the user prompt. Convert the prompt to lowercase. Check if it contains keywords like code, write, build, or explain. If it does, return the name of the expensive model. If the prompt is short and has no keywords, return the name of the cheap model. Before sending the request to Mistral, run the prompt through this function to decide which model to use.

### Step 3: Security and Guardrails

You must protect against data leaks. A user might type their email or social security number. You also need to block hackers from using prompt injection, which is when someone types ignore previous instructions to hijack the AI.

Create a security module. Use Python regular expressions to find patterns that look like emails or social security numbers. If found, replace them with the word REDACTED. Next, check the prompt for known injection phrases. If an injection is detected, block the request and return an error message. Run every prompt through this security check before routing it.

### Step 4: Semantic Caching

This is where you save the most money. If 100 people ask what is the capital of France, you should only pay the LLM for the first question. The other 99 should get a cached answer instantly.

You will use Redis to store the prompts and answers. But you cannot just do a basic text match. You need semantic matching. If someone asks tell me the capital city of France, that means the same thing, and we should still return the cached answer.

To do this, you use Mistral to generate an embedding for the prompt. An embedding is a list of numbers that represents the meaning of the text. You store that list of numbers in Redis. When a new prompt comes in, you generate its embedding and compare it to the ones in Redis using NumPy. We use a math formula called cosine similarity to check how similar they are. If the similarity is over 85 percent, we return the cached answer and bypass the LLM completely. If it is under 85 percent, we send it to the LLM and save the new prompt and answer to Redis.

### Step 5: Observability with Prometheus

Companies need to know how much money you are saving them. We will use Prometheus to track metrics. Install the Prometheus FastAPI instrumentator. It will automatically track the number of HTTP requests. We also need custom metrics. Create counters for cache hits and cache misses. Every time your code returns a cached answer, increment the hit counter. Create a histogram to track how many tokens the LLM is using. Expose these metrics at a slash metrics endpoint.

### Step 6: Dockerization

The last step is to package everything so it can be run by just one single command. Create a Dockerfile. Use the official Python slim image. Copy your requirements file and install dependencies. Then copy your source code.

Create a docker-compose file. Define three services. The first is your gateway application built from your Dockerfile. Map it to port 8000. The second is Redis, using the official Redis image. The third is Prometheus, using the official Prometheus image. Add a dependency so the gateway waits for Redis to start before booting.

Run docker compose up. You now have a fully containerized enterprise LLM Gateway.`,
  },




  {
    title: "Anomaly Engine -full guide",
    description:
      "Fraud detection is broken. Most companies rely on batch processing or static rules that hackers can easily bypass. Here's how to build a real-time streaming pipeline paired with an autonomous agent that catches bots in milliseconds and filters out false positives.",
    tags: ["Kafka", "Machine Learning", "LangGraph", "FastAPI"],
    date: "2026-09-02",
    readTime: "4 min read",
    content: `Fraud detection is broken. Most companies rely on batch processing, meaning they analyze yesterday's data today. By the time a fraudulent transaction or a bot attack is detected, the money is already gone. The alternative is static rules, like blocking a user if they make five requests a minute. Hackers easily bypass static rules by setting their bots to four requests a minute.

The solution is a real-time streaming pipeline paired with an autonomous agent. This system ingests live user events, scores them using unsupervised machine learning in milliseconds, and triggers an AI investigator to analyze the threat.

Here is exactly how to build this using Apache Kafka, scikit-learn, LangGraph, and FastAPI.

### Step 01: The Streaming Backbone

The system starts with data ingestion. Instead of sending user events directly to a database, which would crash under high traffic, the events are sent to Apache Kafka. Kafka acts as a massive shock absorber. It holds thousands of events in a queue so the downstream systems are not overwhelmed.

A Python script acts as a data simulator. It generates realistic user clickstream events, such as logins, page views, and cart additions. To ensure the machine learning model actually has anomalies to catch, the simulator is programmed to occasionally inject bot behavior. A bot event is characterized by an impossibly fast processing time, like five milliseconds, and a burst of twenty requests in one second.

These events are published to a Kafka topic named raw-user-events. At this stage, the data is just sitting in the queue waiting to be processed.

### Step 02: The Machine Learning Detection Engine

The next component is a Kafka consumer. Its job is to pull events from the queue and score them.

For the machine learning model, an Isolation Forest is the industry standard for real-time anomaly detection. Unlike traditional models that try to learn what normal data looks like, an Isolation Forest isolates anomalies. It builds random decision trees. Anomalies, being rare and different, get isolated very close to the root of the tree. This makes the mathematical computation incredibly fast, taking less than a millisecond per event.

The model cannot run on raw text. The consumer must first extract numerical features from the event. It calculates the processing time, the time since the user's last action, and a numerical code for the action type.

Crucially, the model requires a warmup phase. Unsupervised models do not know what an anomaly is until they learn what normal looks like. The system buffers the first two hundred events it receives. It uses these to train the Isolation Forest. Once trained, it switches to scoring mode. Every new event is scored. If the model returns a negative one, the event is an anomaly. The consumer immediately pushes this flagged event to a second Kafka topic named flagged-anomalies.

### Step 03: The Autonomous AI Investigator

The machine learning model is fast, but it is dumb. It only looks at numbers. It might flag a human user who took three seconds to type their password as an anomaly, simply because three seconds is slower than the baseline. This creates false positives.

To solve this, a second Kafka consumer listens to the flagged-anomalies topic. When an anomaly arrives, it triggers an agent. This agent acts as a virtual Security Operations Center analyst.

The agent is built using LangGraph. LangGraph allows the creation of a state machine, meaning the AI operates in a continuous loop of reasoning rather than just generating text. When the agent receives an anomaly, it analyzes the context. It looks at the processing time and the action type.

The agent then categorizes the threat. If it sees a processing time of five milliseconds, it knows this is a machine and labels it a high threat, recommending an immediate IP block. If it sees a processing time of three seconds on a login page, it recognizes this is just a slow human typing on a phone, labels it a low threat, and recommends monitoring only. The agent outputs this analysis as a structured JSON report.

### Step 04: The Live Dashboard and Observability

For an engineering team to trust an autonomous system, they need to see it working. A FastAPI backend is used to create a live dashboard.

The FastAPI server exposes a WebSocket endpoint. As the AI agent reasons through the threat analysis, it streams its thoughts and decisions to the frontend via WebSockets. The dashboard displays a live console showing the AI categorizing the threats in real-time.

This observability layer is critical. It proves the system is actually processing data and provides visibility into the AI decision-making process.

## Conclusion

Building an anomaly engine is not just about training a model. It requires orchestrating streaming data, real-time machine learning inference, and autonomous AI agents. By combining Kafka for ingestion, an Isolation Forest for detection, and LangGraph for investigation, the system achieves true AIOps. It catches bots in milliseconds and filters out false positives automatically, saving human engineers from hours of manual triage.


## Please consider giving a star if it helps you. Thanks for visiting.`

  },
{
  title: "From Messy CSV to Boardroom Insights: A Complete E-Commerce Analytics Case Study",
  description: "Analyzing over one million transactions for ShopSmart: the complete journey from raw data cleaning to boardroom-ready insights, including campaign evaluation with seasonality controls, customer segmentation, and cross-selling opportunities.",
  tags: ["E-Commerce", "Analytics", "RFM Segmentation", "Data Cleaning", "Python", "Pandas", "Business Intelligence"],
  date: "2026-09-08",
  readTime: "6 min read",
  content: `This article documents the complete journey of analyzing over one million transactions for ShopSmart, an online retailer. This will cover not just the insights but the specific technical obstacles encountered and how to solve them.

## The Business Questions

We were given a raw transaction dataset (Online Retail II) and asked to answer three critical questions for Sarah (Boss), the marketing lead:

1. Did the Summer Glow marketing campaign actually generate incremental revenue, or was it just seasonal noise?
2. Who are our most valuable customers, and who is at risk of churning?
3. What products do our best customers buy together, and how can we leverage this for cross-selling?

These are not academic exercises. The answers directly impact budget allocation, retention strategy, and merchandising decisions.

## Phase 1: Data Cleaning and Validation

The dataset contained 1,067,371 rows across eight columns. Before any analysis could begin, we had to establish trust in the data.

### Handling Missing Values and Type Conversion

The \`Customer ID\` column had 243,007 missing values. In e-commerce, missing IDs typically represent guest checkout users. Rather than dropping these rows (which would bias our customer analysis), we explicitly labeled them as "GUEST". This allowed us to include their transactional revenue while excluding them from longitudinal customer segmentation where persistent identity is required.

The \`InvoiceDate\` column arrived as strings. Converting to datetime objects was essential for time-series grouping. We also filtered out cancellation invoices (those starting with "C") before calculating revenue, ensuring our metrics reflected actual sales rather than administrative reversals.

### Segmenting Sales vs. Adjustments

Five transactions had negative revenue values. Instead of treating these as outliers to be deleted, we created a \`Transaction_Type\` flag. These five adjustments represented $158,676 in post-sale corrections. While small relative to the $20.9M total revenue, isolating them prevented distortion of product-level profitability analysis. This taught us an important lesson: never silently drop anomalies; categorize them first.

## Phase 2: Campaign Evaluation with Seasonality Controls

Sarah (Boss) wanted to know if Summer Glow worked. The naive approach would be to compare June-August 2011 revenue against the overall average. This would be wrong because retail is highly seasonal. November revenue ($1.5M) is naturally double February revenue ($553K). Comparing summer performance against an annual average that includes holiday peaks would make any summer campaign look like a failure.

### The Correct Baseline

We compared Summer 2011 (campaign period) against Summer 2010 (historical baseline). This same-month year-over-year comparison controls for seasonality. The result was a +6.7% revenue lift, representing $46,614 in incremental monthly revenue.

### Diagnosing the Mechanism

A 6.7% lift tells us that it worked, but not why. We analyzed product concentration during the campaign period. After removing non-product entries like shipping fees and internal test transactions, the top 10 SKUs accounted for only 10.9% of campaign revenue.

This was a critical finding. If the top 10 products had driven 60% of revenue, the recommendation would be to double down on those specific items next year. But broad-based engagement meant the campaign messaging resonated across the entire assortment. The actionable insight was to maintain broad creative strategy rather than concentrating budget on hero products.

**[Chart: Monthly Core Sales Revenue - Summer Glow Campaign Impact]**

## Phase 3: Customer Segmentation and the Skewed Data Problem

We implemented RFM (Recency, Frequency, Monetary) segmentation to identify high-value customers. This is standard practice, but our data presented a classic e-commerce challenge: extreme skew.

### When Quintiles Break

Standard RFM scoring uses \`pd.qcut(q=5)\` to split customers into five equal groups. This assumes the data can be evenly distributed. In our dataset, 44% of registered customers had purchased exactly once. When nearly half your data shares the same value, quintile boundaries collapse. Pandas throws a \`ValueError: Bin edges must be unique\` because it cannot create five distinct bins when 44% of observations are identical.

### The Dynamic Scoring Solution

Rather than forcing artificial splits or arbitrarily changing the number of segments, we implemented dynamic label generation. We used \`retbins=True\` to capture the actual bin edges after duplicate removal, calculated the true number of segments (\`n_bins = len(bins) — 1\`), and sliced our label array to match. For Frequency, this meant accepting four tiers instead of five. For Recency and Monetary, which were more evenly distributed, we retained five tiers.

This produced accurate, data-driven segments rather than mathematically convenient but meaningless ones. The output revealed that true "champions" were not perfect 5–5–5 scorers but 5–4–5 customers (high recency, medium frequency, high monetary). This reflected ShopSmart's wholesale-heavy base where high-spend customers buy in bulk less frequently. Redefining success around this reality was more valuable than chasing an idealized segment that did not exist.

**[Chart: Customer Segmentation - Retention Gap Identified]**

## Phase 4: Product Affinity Among High-Value Customers

General market basket analysis reveals what everyone buys. But general popularity does not drive margin. We needed to know what valuable customers buy together.

We filtered transactions to only include champion-equivalent customers (RFM scores 54x+) and computed co-purchase frequencies. The top bundle was Red and White Heart T-Light Holders appearing together 604 times. Other top pairs included color variants of lunch bags and matching home decor frames.

The pattern was clear: customers buy the same design in multiple colors, or complementary items within a theme. This is fundamentally different from buying unrelated products. The business implication is specific: create "Complete the Set" bundles at checkout and test thematic collection pricing. Generic "frequently bought together" recommendations would miss this nuance.

**[Chart: Top Product Bundles - Cross-Sell Opportunities (Champion Customers)]**

## Phase 5: Visualization as Communication

Created four charts designed for presentation:

1. **Monthly Revenue Trend** — with the campaign period highlighted and the +6.7% lift annotated directly on the chart. No separate legend needed; the insight is embedded in the visual.

2. **RFM Segment Distribution** — showing the 44% one-time buyer problem as the dominant bar. Numbers are displayed on each bar so the magnitude is immediately apparent.

3. **Product Bundle Horizontal Bar Chart** — focused exclusively on champion customers. Truncated product names prevent label overflow while preserving readability.

4. **Campaign Summary Card** — serving as a single-slide executive takeaway with baseline, performance, lift percentage, and verdict.

**[Chart: Campaign Impact Summary Card]**

Each chart answers "so what?" without requiring verbal explanation.

## Key Takeaways

1. **Seasonality controls are non-negotiable.** — Never evaluate campaigns against overall averages. Same-period year-over-year comparison is the minimum standard.

2. **Skewed data requires adaptive methods.** — Standard statistical functions assume distributions that real-world data rarely satisfies. Build flexibility into your scoring logic.

3. **Segmentation should drive action, not taxonomy.** — If you cannot design a distinct intervention for a segment, merge it. Actionability matters more than granularity.

4. **Documentation determines impact.** — Analysis without reproduction instructions and business context sits unused. Write for the reader who will never run your code.

5. **Infrastructure friction is part of the job.** — Version control conflicts, shell quirks, and environment issues consume real time. Budget for them. Knowing when to pause automation and focus on insights is a professional skill.

6. **Visualizations must embed the insight.** — A chart without annotations is decoration. The conclusion should be visible within three seconds of viewing.

---

All charts are saved as PNGs and can be used directly in presentations without re-running code. The \`Data/\` folder is excluded from Git tracking via sparse checkout to protect sensitive information and maintain repository performance.

Please consider giving a star on GitHub if you like this project.`
 },

{
  title: "Enable GitHub 2FA with KeePass: A Privacy-Focused Alternative",
  description: "Ditch cloud-synced authenticators like Authy, Microsoft, or Bitwarden. Learn how to use KeePass for GitHub 2FA to keep your TOTP codes completely offline, free, and entirely under your control.",
  tags: ["GitHub", "KeePass", "Cybersecurity", "2FA", "Privacy", "TOTP", "Open Source"],
  date: "2026-09-16",
  readTime: "4 min read",
  content: `GitHub pushes you toward Authy, Microsoft Authenticator, and Bitwarden when setting up two-factor authentication (2FA). But these "convenient" options come with hidden privacy trade-offs.

## The Problem with Default Authenticators

Why should you avoid the mainstream suggestions? 

- **Authy:** Cloud-synced codes mean Twilio collects and processes your data.
- **Microsoft Authenticator:** Tied to Microsoft’s ecosystem and tracks your activity.
- **Bitwarden:** Requires a premium subscription just to access TOTP code generation.

## Why KeePass ?

KeePass offers a strictly privacy-focused approach to 2FA:

- **Open-source and auditable:** Anyone can inspect the code.
- **Completely offline:** No cloud required (though you can self-host syncing via Syncthing to your local laptop, phone, or server).
- **Free forever:** No premium tiers, no surprise paywalls.
- **Local storage:** Your data never leaves your computer unless you want it to.
- **Works offline:** Generates codes without an internet connection.
- **No third-party dependency:** You own your security architecture.

If you already use KeePass for password management, using it for 2FA is the logical next step. It’s that simple.

## Step 1: Retrieve GitHub’s Secret Key

1. Navigate to GitHub’s 2FA setup page where the QR code is displayed.
2. Look for a link that says "Can't scan?" or "enter setup key manually".
3. Click it to reveal your plain-text secret key.
4. Copy this long text string (e.g., \`JBSWY3DPEBLW64TMMQ...\`).

## Step 2: Add the Secret Key to KeePass

1. Open your KeePass database.
2. Find or create an entry for GitHub (edit the existing one if you already have it).
3. Right-click the entry and select **Edit Entry**.
4. Look for the **TOTP** field or button in the dialog window.
5. Paste your secret key into this field.
6. Click **OK** and save your database.

## Step 3: Get Your Verification Code

1. Switch back to GitHub’s 2FA setup page.
2. Open your GitHub entry in KeePass.
3. Look at the TOTP field — you will see a 6-digit code that refreshes every 30 seconds.
4. Copy this code.
5. Paste it into GitHub’s verification field (where it says "XXXXXX").
6. Click **Continue**.

## Step 4: Securely Store Backup Codes

GitHub will provide recovery codes. These are critical for regaining access if you lose your KeePass database or your computer breaks.

1. Copy all the provided recovery codes.
2. Create a new KeePass entry titled "GitHub Backup Codes".
3. Paste the codes into the notes field.
4. Save the entry.

Don't lose these. They are your failsafe.

## Verify It Works

To ensure everything is set up correctly:

1. Log out of your GitHub account.
2. Log back in using your username and password.
3. When GitHub prompts for a 2FA code, open KeePass and view your GitHub entry’s TOTP field.
4. Copy the 6-digit code and enter it.
5. You’re in. 

Your GitHub account is now protected with 2FA using only KeePass.

## Why This Matters

By utilizing KeePass over cloud-based authenticators, you are taking back control:

- **You own your security:** No corporate entity controls your 2FA codes.
- **No data harvesting:** Your authentication attempts aren't logged or analyzed.
- **True offline access:** Codes work even without the internet.
- **One tool, one password:** Everything stays in one place you control.
- **Free forever:** No premium tiers or hidden costs.

GitHub doesn't heavily advertise manual TOTP setup because they prefer you use services that generate network traffic or integrate with their tracking ecosystems. But it works perfectly, and it's far more private.

## Conclusion

1. **Privacy is an active choice.** Default options often prioritize data collection over user security.
2. **Offline is secure.** Storing TOTP secrets locally eliminates an entire attack vector (cloud breaches).
3. **Consolidation reduces friction.** Managing passwords and 2FA in one open-source tool is simpler and safer.
4. **Backup codes are mandatory.** Always store recovery codes securely offline to prevent catastrophic lockouts.

GitHub’s default suggestions prioritize convenience and data collection over privacy. KeePass is the privacy-focused, ownership-focused alternative. It’s free, it’s simple, and it keeps your security entirely in your hands.`
},

{
  title: "The 4 Best Datasets to practice Tableau as beginner (And Where to Find Them)",
  description: "These datasets help you understand how to move around in tableau without getting overwhelmed",
  tags: ["Tableau", "Data Analysis", "Data Visualization", "Beginners", "Datasets", "Analytics", "Kaggle"],
  date: "2026-09-20",
  readTime: "4 min read",
  content: `

## 1. The "Global Superstore" Dataset (The Gold Standard)

If there is a holy grail of Tableau practice data, this is it. It’s a massive spreadsheet of a fictional retail store’s sales, profits, customers, and locations. 

- **What it teaches you:** Everything. It teaches you how to make line charts over time, how to track profit by category, and how to connect different tables of data together. 
- **Where to find it:** Just search "Sample Superstore xls" on Google, or grab it on Kaggle.
- **Pro Tip:** Use this dataset to build your very first "Executive Dashboard." Make a map of sales by state, a bar chart of profit by category, and put them on one screen.

## 2. The "Netflix Movies & TV Shows" Dataset

This one contains every movie and show available on Netflix, along with the release year, duration, and genre. It is super fun to explore because you actually know the titles.

- **What it teaches you:** How to work with text (string) data and how to build interactive filters so users can click on "Horror" and see only horror movies.
- **Where to find it:** Kaggle - Netflix Shows.
- **Pro Tip:** The "genre" column in this file is messy (it lists multiple genres separated by commas in one cell). Right-click that column in Tableau and select "Split." Boom Tableau automatically separates the genres into clean columns.

## 3. The "NYC Airbnb" Dataset

This dataset has thousands of Airbnb listings in New York City, complete with prices, neighborhoods, and exact latitude/longitude coordinates.

- **What it teaches you:** Maps Tableau has incredible built-in mapping capabilities. This dataset teaches you how to plot dots on a map and use "heatmaps" to show where things are the most expensive.
- **Where to find it:** Kaggle - NYC Airbnb Data.
- **Pro Tip:** Double-click "Latitude" and "Longitude" in your data pane. Tableau instantly builds a map of NYC. Drag the "Price" column to the "Color" box. Darker colors will instantly show you the priciest neighborhoods.

## 4. World Bank GDP & Population Data

A simple, clean dataset containing every country in the world, their population, and their GDP (economic output) over the last few decades.

- **What it teaches you:** It teaches you "Filled Maps" (coloring whole countries instead of plotting dots) and how to build side-by-side comparisons. 
- **Where to find it:** Search "World Bank GDP dataset Kaggle" or grab it from the Maven Analytics Data Playground.
- **Pro Tip:** Double-click the "Country" field. Tableau automatically recognizes them as geographic locations and generates a world map. Drag "GDP" to the color mark. 

## Where to Find More Datasets

If you don't want to use Kaggle,here other two great options:

1. **Maven Analytics Data Playground:** The best data playground specifically built for Tableau/Power BI learners. They have clean datasets about Pizza sales, World Cup history, and Video Game sales. 
2. **Data.gov:** The US government's open data portal. Great for massive, real-world CSVs on agriculture, climate, and economics.`

},

];
