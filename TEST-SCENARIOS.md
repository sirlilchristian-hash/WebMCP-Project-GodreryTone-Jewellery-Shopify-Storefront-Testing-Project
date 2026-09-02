GodreryTone Jewellery — WebMCP Test Scenarios

1. Purpose

This document defines practical test scenarios for the GodreryTone Jewellery WebMCP integration.

The tests are designed to demonstrate that the WebMCP implementation can support a real jewellery-shopping journey using natural-language customer requests while working with the existing Shopify commerce environment.

The scenarios focus on:

- Natural-language shopping intent
- Customer context
- Jewellery discovery
- Regional market handling
- Budget and currency
- Product information
- Market-aware pricing
- Shipping eligibility
- Customer decision-making
- Direct Shopify product routing
- Handling uncertainty

The goal is not to test every possible sentence a customer could write.

The goal is to demonstrate that the implemented WebMCP capabilities work together to solve realistic shopping problems.

---

2. Test Environment

The tests should be performed against the live GodreryTone Jewellery Shopify storefront with WebMCP enabled.

The agent should be able to discover and invoke the registered WebMCP capabilities exposed by the implementation.

Testing should verify both:

1. Tool behaviour
2. Customer-facing result

A successful test should therefore demonstrate not only that a tool can be called, but that the resulting information is useful to the customer's shopping journey.

---

3. Test Scenario 1 — Shopping Intent

Customer Request

«"I am looking for earrings."»

Expected Behaviour

The agent should understand that the customer is looking for earrings and use the appropriate shopping/product-discovery capability.

Expected Result

The response should identify relevant jewellery products rather than treating the request as a generic conversation.

Capability Demonstrated

Shopping Intent

Success Criteria

- The requested jewellery category is correctly understood.
- Relevant product discovery can follow.
- The response remains connected to the GodreryTone catalogue.

---

4. Test Scenario 2 — Occasion

Customer Request

«"I need jewellery for a wedding."»

Expected Behaviour

The agent should recognize the wedding as the customer's shopping occasion.

The occasion should help provide context for subsequent product discovery.

Expected Result

The agent should use the occasion as part of the shopping context when identifying suitable jewellery.

Capability Demonstrated

Occasion

Success Criteria

- Wedding is correctly interpreted as the occasion.
- The occasion can contribute to product relevance.
- The agent does not treat the request as an unrelated generic product search.

---

5. Test Scenario 3 — Style

Customer Request

«"Show me something elegant and sophisticated."»

Expected Behaviour

The agent should identify the customer's preferred style.

Expected Result

The style information should be available to the product-discovery process.

Capability Demonstrated

Style

Success Criteria

- "Elegant" and/or "sophisticated" are understood as style requirements.
- Product discovery can use the style context.
- Results remain relevant to jewellery shopping.

---

6. Test Scenario 4 — Recipient

Customer Request

«"I want to buy a gift for my wife."»

Expected Behaviour

The agent should understand that the jewellery is intended for the customer's wife.

Expected Result

The recipient context should contribute to the shopping recommendation.

Capability Demonstrated

Recipient

Success Criteria

- The recipient is correctly identified.
- The information can be combined with other shopping requirements.
- The agent does not assume unnecessary personal information.

---

7. Test Scenario 5 — Age

Customer Request

«"I'm looking for something suitable for a young adult."»

Expected Behaviour

The agent should process the relevant age/suitability context where applicable.

Expected Result

The age information can be considered when determining appropriate products or recommendations.

Capability Demonstrated

Age

Success Criteria

- Age-related context is interpreted correctly.
- The information can contribute to product suitability.
- The agent avoids making unsupported assumptions.

---

8. Test Scenario 6 — Regional Market

Customer Request

«"I'm shopping from Uganda. What jewellery can I buy?"»

Expected Behaviour

The system should use Uganda as the customer's country context and resolve the applicable internal shopping configuration.

The customer should not need to know the internal market identifier.

Expected Result

The response should reflect the applicable shopping context and available catalogue information.

Capability Demonstrated

Regional Market

Success Criteria

- Uganda is correctly recognized as the destination country.
- The appropriate internal market context is used.
- Internal market IDs/names are not unnecessarily exposed to the customer.
- Product availability is considered within the applicable context.

---

9. Test Scenario 7 — Budget & Currency

Customer Request

«"My budget is UGX 100,000. What can I afford?"»

Expected Behaviour

The system should recognize UGX as the customer's budget currency and use the configured FX infrastructure where required by the shopping flow.

Expected Result

The budget can be normalized for product matching without pretending that the Shopify store has unrestricted native multi-currency functionality.

Capability Demonstrated

Budget & Currency

Success Criteria

- The budget amount is correctly interpreted.
- The currency is correctly identified.
- Configured FX infrastructure is used when required.
- No unsupported exchange rate or price is invented.
- The customer-facing result is transparent about the pricing basis.

---

10. Test Scenario 8 — Product / Catalogue

Customer Request

«"Find elegant earrings for a wedding."»

Expected Behaviour

The agent should combine the available shopping context and query the relevant GodreryTone product/catalogue information.

Expected Result

Relevant products should be identified from the available store data.

Capability Demonstrated

Product / Catalogue

Success Criteria

- Products come from the actual store/catalogue data.
- Results are relevant to the customer's requirements.
- Applicable market context is respected.
- The agent does not invent products.

---

11. Test Scenario 9 — Market-Aware Pricing

Customer Request

«"How much is this product for me?"»

Expected Behaviour

The system should establish the applicable pricing information for the customer's shopping context.

Expected Result

The customer should receive the price that the implementation can actually establish.

Where currency presentation requires the supported FX flow, the shared FX infrastructure may be used.

Capability Demonstrated

Market-Aware Pricing

Success Criteria

- The correct product is identified.
- Applicable pricing information is established from available store data.
- Currency presentation is transparent.
- The agent does not invent a price.

---

12. Test Scenario 10 — Shipping Eligibility

Customer Request

«"Can this product be shipped to Uganda?"»

Expected Behaviour

The system should evaluate the available destination-related fulfilment information.

Expected Result

The response should distinguish between:

Confirmed

The available information establishes eligibility.

Not Eligible

The available information indicates that the destination cannot be served.

Unable to Establish

There is insufficient verified information to guarantee eligibility.

Capability Demonstrated

Shipping Eligibility

Success Criteria

- Destination is correctly interpreted.
- The system uses available fulfilment information.
- Uncertainty is not presented as a guarantee.
- The agent does not invent shipping information.

---

13. Test Scenario 11 — Customer Purchase Decision

Customer Request

«"If this product isn't available for my country, can I just use another country's market?"»

Expected Behaviour

The system should explain the relevant option or limitation without silently changing the customer's shopping country or market.

Expected Result

The customer remains responsible for the consequential purchase decision.

Capability Demonstrated

Customer Purchase Decision

Success Criteria

- The system explains the available option.
- The customer's country/market is not silently changed.
- The AI does not make the purchase decision on behalf of the customer.
- Any regional alternative is clearly presented as an option.

---

14. Test Scenario 12 — Direct Product Routing

Customer Request

«"Find me an elegant pair of earrings and show me where I can view it."»

Expected Behaviour

After identifying a relevant product, the agent should provide the corresponding Shopify product path where available.

Expected Result

The customer can move from AI-assisted discovery directly to the actual Shopify product page.

Capability Demonstrated

Final Integration

Success Criteria

- A real store product is identified.
- The product path corresponds to the identified product.
- The customer can continue the normal Shopify shopping experience.

---

15. Test Scenario 13 — Complete Customer Journey

This is the primary end-to-end demonstration.

Customer Request

«"I'm shopping from Uganda. I need an elegant pair of earrings for my wife for a wedding. My budget is UGX 100,000. What can I actually buy?"»

Expected Interpretation

Intent
→ Earrings

Occasion
→ Wedding

Recipient
→ Wife

Style
→ Elegant

Country
→ Uganda

Budget
→ UGX 100,000

Expected Flow

Customer Request
       ↓
Shopping Intent
       ↓
Occasion / Recipient / Style
       ↓
Regional Market
       ↓
Budget & Currency
       ↓
Product / Catalogue
       ↓
Market-Aware Pricing
       ↓
Shipping Eligibility
       ↓
Customer Purchase Decision
       ↓
Final Integration
       ↓
Relevant Shopify Product

Expected Result

The agent should provide a customer-facing result that explains:

- Which products are relevant
- Why they fit the request
- The applicable pricing information
- Any relevant currency presentation
- Shipping/eligibility information where it can be established
- Any important uncertainty
- A path to the actual Shopify product page

Success Criteria

The test is successful when the agent can move from a natural-language request containing multiple shopping requirements to a useful, store-backed shopping result without inventing unsupported information.

---

16. Test Scenario 14 — Uncertainty Handling

Customer Request

«"Is this definitely available and guaranteed to arrive in Uganda?"»

Expected Behaviour

The system should distinguish between information that can be verified and information that cannot be established.

Expected Result

If the implementation cannot guarantee availability or delivery, the response should clearly communicate that limitation.

Capability Demonstrated

Shipping Eligibility + Product/Catalogue + Final Integration

Success Criteria

The AI must not convert incomplete information into a false guarantee.

---

17. Test Scenario 15 — Minimal Request

Customer Request

«"Show me jewellery."»

Expected Behaviour

The agent should avoid unnecessarily requiring every possible customer attribute before helping.

It should use the information available and perform appropriate product discovery.

Expected Result

The customer receives useful product results or an appropriate next step.

Capability Demonstrated

Tool Coordination

Success Criteria

- The agent does not blindly invoke every tool.
- Only relevant capabilities are used.
- The customer can begin shopping without providing unnecessary information.

---

18. Test Scenario 16 — Multi-Constraint Request

Customer Request

«"I'm in Uganda, looking for a stylish gift for my wife for a birthday, and I don't want to spend more than UGX 150,000."»

Expected Interpretation

Country
→ Uganda

Intent
→ Gift / Jewellery

Recipient
→ Wife

Occasion
→ Birthday

Style
→ Stylish

Budget
→ UGX 150,000

Expected Behaviour

The agent should coordinate the relevant capabilities instead of treating the entire request as a single keyword search.

Success Criteria

The resulting products should reflect as many of the customer's stated constraints as the available store information allows.

---

19. Test Result Classification

Each test can be recorded using the following simple classification:

Result| Meaning
PASS| Expected behaviour was demonstrated
PARTIAL| Core behaviour worked but some information could not be established
FAIL| Expected behaviour was not demonstrated
NOT APPLICABLE| Scenario could not reasonably be tested with the current store data

For production-facing commerce behaviour, PARTIAL should not automatically be considered a failure when the system correctly communicates uncertainty.

For example, if shipping information cannot be verified, returning Unable to Establish is preferable to falsely returning Confirmed.

---

20. What These Tests Demonstrate

Together, these scenarios demonstrate the major parts of the WebMCP implementation:

Natural Language
       ↓
Intent Understanding
       ↓
Customer Context
       ↓
Regional Context
       ↓
Budget / Currency
       ↓
Catalogue Discovery
       ↓
Pricing
       ↓
Shipping
       ↓
Customer Control
       ↓
Shopify Product

The tests therefore evaluate WebMCP as an agent-facing shopping layer, rather than simply testing isolated product searches.

---

21. Submission Demonstration

For the final challenge demonstration, the most important scenario is the complete customer journey:

«"I'm shopping from Uganda. I need an elegant pair of earrings for my wife for a wedding. My budget is UGX 100,000. What can I actually buy?"»

This single request demonstrates the core idea of the project:

A customer expresses shopping intent naturally, and the WebMCP-enabled agent coordinates the relevant capabilities to produce a store-backed shopping result.

The additional scenarios can then be used to demonstrate individual capabilities such as market handling, currency, pricing, shipping, uncertainty, and direct product routing.
