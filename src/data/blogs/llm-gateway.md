---
title: "Documentation - llm gateway"
description: "Every company is building AI apps right now, but they are bleeding money on API costs and risking data leaks. Here's how to build a gateway that secures, caches, and routes prompts to the cheapest model."
date: "2026-09-06"
readTime: "5 min read"
tags: ["LLM", "FastAPI", "Docker", "Gateway"]
---

Every company is building AI apps right now, but they are bleeding money on API costs and risking data leaks. When you send a prompt to a large language model provider, you pay per token. If a user asks a simple question like what is two plus two, you still pay the full price. Worse, a user might type their social security number into the prompt, sending private data to a third party server.

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

Run docker compose up. 
