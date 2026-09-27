---
title: "From Messy CSV to Boardroom Insights: A Complete E-Commerce Analytics Case Study"
description: "Analyzing over one million transactions from raw data cleaning to boardroom-ready insights."
date: "2026-09-16"
readTime: "5 min read"
tags: ["E-Commerce", "Analytics", "RFM Segmentation", "Data Cleaning", "Python", "Pandas", "Business Intelligence"]
---

This article documents the complete journey of analyzing over one million transactions for ShopSmart, an online retailer. This will cover not just the insights but the specific technical obstacles encountered and how to solve them.

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

Please consider giving a star on [GitHub](https://github.com/voidd-sam/ShopSmart) if you like this project.
