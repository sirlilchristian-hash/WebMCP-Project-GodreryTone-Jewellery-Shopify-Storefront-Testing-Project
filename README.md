# GodreryTone Jewellery — WebMCP Integration

> **WebMCP-powered AI shopping experience for a real-world Shopify jewellery storefront**

[![Shopify](https://img.shields.io/badge/Platform-Shopify-green)](https://www.shopify.com/)
[![WebMCP](https://img.shields.io/badge/AI-WebMCP-blue)](https://developer.chrome.com/)
[![Project Status](https://img.shields.io/badge/Status-Prototype%20%2F%20Testing-orange)](https://github.com/)

## 🔗 Project Links

**Live Store:**
https://godrerytonejewellery.myshopify.com/

**Demonstration Video:**
https://youtu.be/5SkEhm6qwU0

---

## 📌 Project Overview

**GodreryTone Jewellery — WebMCP** is an experimental WebMCP implementation built around a real Shopify jewellery storefront.

The project explores how an AI agent can interact with an existing ecommerce store through structured WebMCP tools rather than relying only on traditional search, filters, and manual navigation.

The goal is simple:

> **How can we make it easier for a customer to tell a store what they want and quickly discover what they can actually buy?**

GodreryTone Jewellery is currently being developed as a global jewellery ecommerce business connecting products from suppliers around the world with customers across different markets.

This made it a practical environment for exploring AI-assisted shopping.

Instead of creating a fictional catalogue for the WebMCP experiment, I applied the implementation to an actual Shopify storefront and its real-world ecommerce constraints.

---

# 🎯 Why I Built This

While building GodreryTone Jewellery, I kept encountering a fundamental ecommerce question:

> **How can I improve the customer experience?**

A customer may already know:

* What type of jewellery they want
* Who they are buying for
* The occasion
* Their preferred style
* Their budget
* Their country

But they may not know which products in a large catalogue satisfy all of those requirements.

For example:

> **"I'm shopping from Uganda. I need an elegant pair of earrings for my wife for a wedding, and my budget is UGX 100,000. What can I actually buy?"**

That single sentence contains multiple requirements.

A traditional storefront may require the customer to manually search through collections, products, filters, prices, and availability.

The WebMCP experiment explores a different approach.

The customer communicates naturally.

The AI agent interprets the request.

The WebMCP tools provide structured capabilities.

The relevant store information is coordinated.

The customer is then directed toward products that may actually fit their requirements.

---

# 💡 The Problem

The project focuses on several real-world ecommerce problems.

### 1. Product Discovery

Customers should not always have to navigate:

```text
Collection
   ↓
Product
   ↓
Back
   ↓
Another Collection
   ↓
Filter
   ↓
Another Product
   ↓
Repeat
```

when they have already described exactly what they want.

---

### 2. Personalization

A request such as:

> "Elegant wedding earrings for my wife"

contains information about:

* Intent
* Occasion
* Recipient
* Style
* Product category

The system should be able to use that information when identifying products.

---

### 3. Country-Specific Availability

GodreryTone Jewellery works with suppliers that may have different fulfilment capabilities.

A product may exist in the catalogue but may not necessarily be serviceable to every country.

Therefore:

> **Product existence does not automatically mean destination availability.**

The WebMCP experience is designed to consider the customer's market and shipping eligibility before presenting a purchase path.

---

### 4. Regional Shopping Possibilities

A customer may encounter products or market configurations associated with another region.

Rather than silently changing the customer's country or shopping context, the intended experience is:

```text
Identify
   ↓
Explain
   ↓
Present the possibility
   ↓
Let the customer decide
```

This keeps important purchasing decisions under the customer's control.

---

### 5. Currency

The current Shopify configuration provides a USD pricing foundation while the store's subscription configuration limits unrestricted currency operation.

To support natural-language customer budgets such as:

> UGX 100,000

the implementation includes a manual conversion-rate layer.

The conceptual flow is:

```text
Customer Currency
        ↓
Configured Conversion Rate
        ↓
USD Budget
        ↓
Product Matching
        ↓
Customer-Facing Currency Presentation
```

This is a supplementary implementation for the current project rather than a claim that the store already has unrestricted native multi-currency functionality.

---

# 🏪 The Real Store Behind the Project

GodreryTone Jewellery is not a fictional ecommerce catalogue created solely for this project.

It is a real Shopify storefront currently under development.

The Shopify infrastructure provides the underlying commerce foundation, including:

* Products
* Collections
* Product information
* Pricing
* Market configuration
* Storefront functionality
* Purchasing infrastructure

The purpose of WebMCP is therefore **not to replace Shopify**.

Instead:

> **WebMCP supplements Shopify with an AI-agent interaction layer.**

Shopify remains the store.

WebMCP provides additional structured capabilities through which an AI agent can interact with the shopping experience.

---

# 🧠 WebMCP Architecture

The high-level architecture can be represented as:

```text
┌──────────────────────────────┐
│       REAL SHOPIFY STORE     │
│                              │
│ Products • Collections       │
│ Pricing • Markets            │
│ Storefront • Commerce        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        WebMCP TOOL LAYER     │
│                              │
│ Structured agent capabilities│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       AI AGENT REQUEST       │
│                              │
│ "Find elegant wedding       │
│ earrings for my wife..."     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   STRUCTURED REQUIREMENTS    │
│                              │
│ Intent • Occasion • Style    │
│ Recipient • Country • Budget │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     STORE INTELLIGENCE       │
│                              │
│ Catalogue • Pricing          │
│ Availability • Shipping      │
│ Regional considerations      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      RELEVANT PRODUCTS       │
│                              │
│ Direct Shopify product path  │
└──────────────────────────────┘
```

---

# 🛠️ The 12 WebMCP Tools

The implementation divides the shopping experience into specialized capabilities.

| #  | Tool                           | Purpose                                                        |
| -- | ------------------------------ | -------------------------------------------------------------- |
| 1  | **Shopping Intent**            | Understand what the customer is trying to buy                  |
| 2  | **Occasion**                   | Understand the occasion behind the purchase                    |
| 3  | **Style**                      | Interpret the customer's desired style                         |
| 4  | **Recipient**                  | Understand who the jewellery is intended for                   |
| 5  | **Age**                        | Handle relevant suitability information                        |
| 6  | **Regional Market**            | Determine the customer's applicable shopping context           |
| 7  | **Budget & Currency**          | Normalize customer budget information                          |
| 8  | **Product / Catalogue**        | Find relevant products from store data                         |
| 9  | **Market-Aware Pricing**       | Present applicable pricing appropriately                       |
| 10 | **Shipping Eligibility**       | Determine whether the purchase can proceed for the destination |
| 11 | **Customer Purchase Decision** | Keep regional and purchase decisions under customer control    |
| 12 | **Final Integration**          | Coordinate the verified shopping result and purchase path      |

These tools are not intended to function as twelve unrelated features.

Together, they represent a complete shopping journey:

```text
"What do I want?"
        ↓
"Who is it for?"
        ↓
"What is the occasion?"
        ↓
"What style do I want?"
        ↓
"Where am I shopping from?"
        ↓
"What is my budget?"
        ↓
"What products fit?"
        ↓
"What is the applicable price?"
        ↓
"Can it reach me?"
        ↓
"What options do I have?"
        ↓
"Which product do I want?"
        ↓
"Take me to the product."
```

---

# 🛍️ Example Customer Interaction

A customer could say:

> **"I'm shopping from Uganda. I need an elegant pair of earrings for my wife for a wedding. My budget is UGX 100,000. What can I actually buy?"**

The request can be interpreted as:

```text
Country
└── Uganda

Product
└── Earrings

Recipient
└── Wife

Occasion
└── Wedding

Style
└── Elegant

Budget
└── UGX 100,000
```

The WebMCP implementation can then coordinate the relevant capabilities.

The intended result is not simply:

> "Here are some earrings."

Instead, the agent should be able to help answer:

* Which products are relevant?
* Which products fit the customer's requirements?
* What is the applicable price?
* Is the product available for the customer's market?
* Can shipping eligibility be established?
* Are there relevant regional possibilities?
* Where can the customer inspect the actual product?

---

# 🌍 Country & Supplier Considerations

GodreryTone Jewellery follows a global sourcing model.

Different suppliers may have different fulfilment capabilities.

Therefore, product matching must consider more than catalogue existence.

Conceptually:

```text
Product Exists?
       ↓
Is it Relevant?
       ↓
Is it Appropriate for the Market?
       ↓
Can the Supplier Fulfil the Destination?
       ↓
What Price Applies?
       ↓
Can the Customer Proceed?
```

The implementation is designed around the principle:

> **Do not pretend that a product is guaranteed to ship when shipping eligibility has not been established.**

This is especially important for an ecommerce experience involving multiple suppliers and markets.

---

# 💱 Currency Handling

The current implementation includes a manual conversion infrastructure to allow the AI shopping experience to interpret budgets expressed in currencies other than USD.

For example:

```text
UGX 100,000
      ↓
Configured UGX → USD Rate
      ↓
USD Budget
      ↓
Product Matching
      ↓
Matched Product
      ↓
USD Product Price
      ↓
UGX Customer-Facing Price
```

The conversion infrastructure is intended as a practical supplement to the current Shopify configuration.

As the store's commerce infrastructure evolves, this layer can be adapted to native Shopify market/currency functionality or an appropriate external currency service.

---

# 🔗 Direct Product Discovery

One of the important goals is to reduce the distance between:

> **"I know what I want."**

and:

> **"Show me the product."**

The AI agent assists with discovery.

Shopify remains the destination for the actual product experience.

The intended flow is:

```text
Natural-Language Request
          ↓
AI Understanding
          ↓
WebMCP Tools
          ↓
Product Matching
          ↓
Relevant Product
          ↓
Shopify Product Page
          ↓
Customer Continues Shopping
```

This means WebMCP is not intended to replace the normal Shopify storefront.

It creates another way for customers to reach it.

---

# 🎥 Project Demonstration

The project demonstration uses the real GodreryTone Jewellery Shopify storefront as the experimentation environment.

The demonstration covers:

### 01 — Introduction

Introduction to GodreryTone Jewellery and the motivation behind applying WebMCP to the store.

### 02 — Customer Scenario

A realistic customer request:

> **"I'm shopping from Uganda. I need an elegant pair of earrings for my wife for a wedding. My budget is UGX 100,000. What can I actually buy?"**

### 03 — WebMCP Demonstration

Demonstration of how the natural-language request connects with the WebMCP-powered shopping experience.

### 04 — Master Implementation

A brief walkthrough of the master implementation file and supporting logic.

### ▶️ Watch the Demonstration

**YouTube:**
https://youtu.be/5SkEhm6qwU0

---

# 🚀 What WebMCP Changed

The objective was never to create an AI that simply responds:

> "Here are some jewellery products."

The objective was to make the existing store more capable of responding to a **real customer request**.

The customer communicates naturally.

The agent identifies structured requirements.

The WebMCP tools coordinate relevant store information.

Country-specific availability can be considered.

Supplier limitations can be respected.

Budget information can be normalized.

Products can be identified faster.

Pricing can be presented appropriately.

Shipping eligibility can be considered.

Regional possibilities can be surfaced.

And the customer can be directed back to the normal Shopify product experience.

---

# 🔐 Customer Control

An important design principle of the project is:

> **The AI should assist the customer, not silently make important purchasing decisions for them.**

For example, if a regional alternative becomes relevant, the system should explain the situation rather than silently changing the customer's market.

The intended philosophy is:

```text
AI identifies
      ↓
AI explains
      ↓
AI presents options
      ↓
Customer decides
```

This is particularly important when country, shipping, pricing, or regional fulfilment considerations are involved.

---

# 🧪 Testing Philosophy

The project is being tested against realistic ecommerce scenarios rather than purely theoretical prompts.

Example testing dimensions include:

| Scenario           | Example                              |
| ------------------ | ------------------------------------ |
| Product discovery  | "Find elegant earrings."             |
| Occasion           | "I need something for a wedding."    |
| Recipient          | "I'm buying for my wife."            |
| Style              | "I want something elegant."          |
| Budget             | "My budget is UGX 100,000."          |
| Country            | "I'm shopping from Uganda."          |
| Availability       | "Can this product reach Uganda?"     |
| Regional option    | "Can I use another regional market?" |
| Product navigation | "Take me to the product."            |

The intention is to evaluate whether the AI-assisted experience can move from natural language to meaningful ecommerce actions.

---

# 📈 Future Direction

This project represents more than adding WebMCP to a jewellery website.

It provides a foundation for exploring AI-assisted ecommerce across other sectors.

The same principle could potentially apply to:

* Fashion
* Electronics
* Travel
* Automotive
* Furniture
* Beauty
* Grocery
* B2B commerce
* Marketplaces
* Local services

The underlying idea remains the same:

> **Let customers describe what they need naturally, then use structured agent capabilities to help them navigate the complexity of finding what they can actually obtain.**

---

# 🌱 What I Learned

For me, the value of this project is not simply that WebMCP was added to a website.

The bigger achievement is applying a newly acquired technology to a **real-world problem I was already experiencing while building a business.**

The project allowed me to explore:

* AI-agent interaction
* WebMCP
* Structured tool design
* Ecommerce personalization
* Product discovery
* Market-aware shopping
* Supplier constraints
* Shipping eligibility
* Currency normalization
* AI-assisted navigation
* Customer-controlled decision making
* Integration with an existing Shopify storefront

It demonstrated how a technology concept can move from documentation and experimentation into a practical business use case.

---

# 🏗️ Project Status

**Status:** `Prototype / Testing`

GodreryTone Jewellery is still being developed toward a fully operational ecommerce business.

The WebMCP implementation is therefore being treated as an experimental and forward-looking AI interaction layer rather than a replacement for Shopify's existing commerce infrastructure.

---

# 🎯 The Bigger Vision

The long-term direction is an ecommerce experience where a customer does not have to figure everything out manually.

Instead of:

> **"Search the store and see what you can find."**

the experience moves toward:

> **"Tell us what you need, and we'll help you understand what you can actually buy."**

For example:

> **"This is what I want. This is who it is for. This is the occasion. This is where I am. This is my budget. Help me find what I can actually buy."**

That is the problem this project is trying to solve.

**Shopify remains the store.**

**WebMCP becomes an additional way for customers and AI agents to interact with that store.**

---

# 👨‍💻 Project Author

**Collins Mogire**

Founder / Builder — **GodreryTone Jewellery**

This project represents part of my journey in building real-world applications and experimenting with emerging AI-agent technologies.

---

# ⭐ Final Note

This project started with a real ecommerce problem:

> **How can I make shopping easier for a customer who knows what they want but does not know where to find it?**

WebMCP provided an opportunity to explore that question directly inside a real Shopify storefront.

The result is an experiment in combining:

**Real commerce + AI agents + structured tools + personalization + market awareness + customer control.**

And this is only the beginning.
