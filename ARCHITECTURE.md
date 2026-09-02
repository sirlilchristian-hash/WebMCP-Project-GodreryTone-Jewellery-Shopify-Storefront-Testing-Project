GodreryTone Jewellery — WebMCP Architecture & Implementation

1. Overview

GodreryTone Jewellery uses WebMCP as an AI-facing interaction layer on top of an existing Shopify jewellery store.

The purpose of the integration is to allow customers to describe what they are looking for naturally, while WebMCP gives an AI agent structured capabilities to understand the request, use relevant store information, and guide the customer toward suitable products.

Shopify remains the underlying commerce platform. WebMCP does not replace the Shopify storefront or purchasing experience.

Customer
   ↓
Natural-language request
   ↓
AI Agent
   ↓
WebMCP Tools
   ↓
GodreryTone Store Data
   ↓
Relevant Result
   ↓
Shopify Product Page

2. Why WebMCP

Jewellery customers do not always know the exact product they want.

A customer may say:

«"I'm in Uganda and need an elegant gift for my wife for a wedding. My budget is UGX 100,000."»

This request contains several pieces of shopping context:

- What they want
- Occasion
- Recipient
- Style
- Country
- Budget
- Currency

WebMCP allows these requirements to be handled through specialized capabilities instead of forcing the customer to manually navigate multiple storefront filters and pages.

3. Architecture

The implementation is organized into three main layers.

Customer Layer

The customer communicates with the AI agent using natural language.

"I need elegant earrings for my wife for a wedding."

WebMCP Agent Layer

The AI agent can use the registered WebMCP tools to understand and process the shopping request.

The tools cover:

1. Shopping Intent
2. Occasion
3. Style
4. Recipient
5. Age
6. Regional Market
7. Budget & Currency
8. Product / Catalogue
9. Market-Aware Pricing
10. Shipping Eligibility
11. Customer Purchase Decision
12. Final Integration

The tools are specialized so that each capability has a clear responsibility.

Commerce Layer

The WebMCP implementation works with the existing GodreryTone Shopify commerce environment and its available store information, including:

- Products
- Collections
- Product information
- Market configuration
- Pricing information
- Availability information
- Shipping-related information
- Shopify product pages

                AI AGENT
                    │
                    ▼
             WEBMCP TOOL LAYER
                    │
       ┌────────────┼────────────┐
       │            │            │
    Customer      Market       Commerce
    Context       Context       Data
       │            │            │
       └────────────┼────────────┘
                    ▼
             Shopping Result
                    │
                    ▼
          Shopify Product Page

4. Market-Aware Shopping

The customer's country is part of the shopping context.

The implementation resolves the customer's country into the applicable internal market configuration and uses that context when determining what should be presented.

Different markets can have different product or collection availability.

Internal market identifiers are implementation details and are not intended to become part of the customer's shopping language.

The customer simply receives the shopping result relevant to their location.

Customer Country
       ↓
Applicable Market Context
       ↓
Relevant Catalogue
       ↓
Applicable Pricing
       ↓
Shipping Considerations

5. Budget & Currency

GodreryTone currently operates with a USD pricing foundation.

Customers may nevertheless express budgets in their own currencies.

The WebMCP implementation therefore includes shared FX infrastructure that can normalize supported customer budgets for product matching and provide currency presentation when explicitly required by the relevant shopping tools.

Customer Budget
      ↓
Customer Currency
      ↓
Configured FX
      ↓
Normalized Budget
      ↓
Product Matching

This supplements the existing Shopify configuration rather than claiming unrestricted native multi-currency functionality.

6. Product Discovery

The Product / Catalogue capability identifies products that can meaningfully fit the customer's request.

Product discovery can take into account relevant customer context such as:

- Shopping intent
- Style
- Occasion
- Recipient
- Budget
- Applicable market

The objective is therefore not simply keyword matching.

It is to identify relevant products within the customer's applicable shopping context.

7. Pricing

Pricing is handled separately from product discovery.

After relevant products are identified, the Market-Aware Pricing capability can establish the applicable pricing information for the customer's shopping context.

Where supported by the shopping flow, the shared FX infrastructure can assist with customer-facing currency presentation.

The implementation is designed to distinguish verified pricing information from information that cannot be established.

8. Shipping Eligibility

A product appearing in the catalogue does not automatically mean it can be delivered everywhere.

The Shipping Eligibility capability therefore considers destination-related information before presenting a shipping conclusion.

The implementation distinguishes between:

- Confirmed — sufficient information exists to establish eligibility.
- Not Eligible — available information indicates that the destination cannot be served.
- Unable to Establish — there is insufficient verified information to guarantee eligibility.

This prevents the AI from turning uncertainty into a false shipping guarantee.

9. Customer Control

The system does not silently change a customer's country, market, or purchase decision.

Where a regional alternative becomes relevant, the architecture follows:

Identify
   ↓
Explain
   ↓
Present Option
   ↓
Customer Decides

The AI assists the customer without making consequential regional decisions on the customer's behalf.

10. Direct Shopify Product Routing

The WebMCP experience is intended to shorten the distance between customer intent and the actual Shopify shopping experience.

The intended flow is:

Customer Request
      ↓
AI Discovery
      ↓
Relevant Product
      ↓
Shopify Product Path
      ↓
Shopify Product Page
      ↓
Customer Continues Shopping

WebMCP therefore acts as an intelligent navigation and discovery layer rather than replacing Shopify.

11. Example End-to-End Flow

Customer:

«"I'm shopping from Uganda. I need an elegant pair of earrings for my wife for a wedding. My budget is UGX 100,000."»

The agent can establish:

Intent       → Earrings
Occasion     → Wedding
Recipient    → Wife
Style        → Elegant
Country      → Uganda
Budget       → UGX 100,000

The relevant WebMCP capabilities can then coordinate:

Customer Context
       ↓
Regional Market
       ↓
Budget / FX
       ↓
Product / Catalogue
       ↓
Market-Aware Pricing
       ↓
Shipping Eligibility
       ↓
Customer Decision
       ↓
Final Integration
       ↓
Relevant Product
       ↓
Shopify Product Page

The result is intended to give the customer a useful, context-aware shopping answer rather than simply returning a generic catalogue search.

12. Implementation Principles

The implementation follows these principles:

Shopify remains the commerce platform.

WebMCP supplements the existing store rather than replacing it.

Tools have specialized responsibilities.

Each registered capability handles a defined part of the shopping journey.

Customer context matters.

Country, budget, occasion, recipient and style can influence product relevance.

Market configuration matters.

Different markets may expose different products or availability.

Availability must be verified.

The existence of a product does not automatically guarantee fulfilment.

Currency must be transparent.

FX infrastructure supports the AI shopping experience without pretending to be unrestricted native Shopify multi-currency.

The customer remains in control.

The AI presents options rather than silently making consequential regional decisions.

The shopping journey should be shorter.

The purpose of the integration is to move the customer from natural-language intent to relevant Shopify products more efficiently.

13. Summary

GodreryTone Jewellery uses WebMCP to connect an AI agent with structured shopping capabilities while preserving Shopify as the underlying commerce experience.

The implementation allows the agent to understand customer intent, apply relevant context, consider market and budget information, identify products, establish pricing and fulfilment information, preserve customer control, and direct the customer to the existing Shopify product experience.

In simple terms:

Natural Language
      ↓
WebMCP
      ↓
Structured Shopping Context
      ↓
Store / Market Information
      ↓
Relevant Product
      ↓
Shopify

WebMCP therefore serves as the agent interaction layer, while Shopify remains the commerce layer.
