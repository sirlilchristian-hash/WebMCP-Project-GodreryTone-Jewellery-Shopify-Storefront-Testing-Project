(function () {
    "use strict";

    /*
   * ============================================================
   * GODRERYTONE WEBMCP
   * Master WebMCP file
   *
   * Current tools:
   * 1. godrerytone_shopping_intent
   * 2. godrerytone_occasion
   *
   * Future tools will be added to THIS SAME FILE.
   * ============================================================
   */
if (!("modelContext" in document)) {
  console.info(
    "[GodreryTone WebMCP] WebMCP is not available in this browser."
  );
  return;
}
/* ============================================================
 * GODRERYTONE WEBMCP
 * BIT 1 — INTERNAL COMMERCE REGISTRY
 *
 * PURPOSE:
 * - Provide stable internal registry infrastructure.
 * - Store normalized commerce relationships.
 * - Keep market IDs separate from destination countries.
 * - Provide deterministic eligibility logic.
 *
 * IMPORTANT:
 * This registry is NOT the authoritative source for current
 * Shopify commerce data.
 *
 * Current products, vendors, markets, countries and assignments
 * should be populated by the dynamic commerce data layer in
 * BIT 1B.
 * ============================================================ */

window.GodreryToneWebMCP =
  window.GodreryToneWebMCP || {};

var GT = window.GodreryToneWebMCP;


/* ------------------------------------------------------------
 * Registry
 * ------------------------------------------------------------ */

GT.registry = GT.registry || {
  vendors: {},
  markets: {},
  regions: {},
  products: {},

  vendorMarketAssignments: {},
  marketCountryAssignments: {},

  vendorRegionAssignments: {},
  regionCountryAssignments: {}
};


/* ------------------------------------------------------------
 * Normalization
 * ------------------------------------------------------------ */

GT.normalizeCountry = function (value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toUpperCase();
};


GT.normalizeId = function (value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
};


/* ------------------------------------------------------------
 * Vendor registration
 * ------------------------------------------------------------ */

GT.registerVendor = function (vendor) {

  if (!vendor) {
    return null;
  }

  var id = GT.normalizeId(
    vendor.id ||
    vendor.vendorId ||
    vendor.name
  );

  if (!id) {
    return null;
  }

  GT.registry.vendors[id] = {
    id: id,
    name: vendor.name || vendor.title || id,
    status: vendor.status || "active"
  };

  return GT.registry.vendors[id];
};


/* ------------------------------------------------------------
 * Market registration
 *
 * IMPORTANT:
 * A market is NOT a country.
 *
 * Example:
 * Australia can exist as a market while also appearing as a
 * country inside another market such as Oceania.
 * ------------------------------------------------------------ */

GT.registerMarket = function (market) {

  if (!market) {
    return null;
  }

  var id = GT.normalizeId(
    market.id ||
    market.marketId ||
    market.code ||
    market.name
  );

  if (!id) {
    return null;
  }

  GT.registry.markets[id] = {
    id: id,
    code: market.code || id,
    name: market.name || market.title || id,
    status: market.status || "active",
    currency: market.currency || null
  };

  return GT.registry.markets[id];
};


/* ------------------------------------------------------------
 * Region registration
 * ------------------------------------------------------------ */

GT.registerRegion = function (region) {

  if (!region) {
    return null;
  }

  var id = GT.normalizeId(
    region.id ||
    region.regionId ||
    region.code ||
    region.name
  );

  if (!id) {
    return null;
  }

  GT.registry.regions[id] = {
    id: id,
    name: region.name || region.title || id,
    status: region.status || "active"
  };

  return GT.registry.regions[id];
};


/* ------------------------------------------------------------
 * Product registration
 * ------------------------------------------------------------ */

GT.registerProduct = function (product) {

  if (!product) {
    return null;
  }

  var id = GT.normalizeId(
    product.id ||
    product.productId ||
    product.handle ||
    product.title
  );

  if (!id) {
    return null;
  }

  GT.registry.products[id] = {
    id: id,
    title: product.title || "",
    handle: product.handle || "",
    vendor: product.vendor || "",
    vendorId: product.vendorId || null,
    status: product.status || "active"
  };

  return GT.registry.products[id];
};


/* ------------------------------------------------------------
 * Vendor → Market assignment
 * ------------------------------------------------------------ */

GT.assignVendorToMarkets = function (
  vendorId,
  markets
) {

  var vendorKey = GT.normalizeId(vendorId);

  if (!vendorKey) {
    return [];
  }

  if (!Array.isArray(markets)) {
    markets = [markets];
  }

  var normalizedMarkets = markets
    .map(function (market) {

      if (market && typeof market === "object") {
        return GT.normalizeId(
          market.id ||
          market.marketId ||
          market.code ||
          market.name
        );
      }

      return GT.normalizeId(market);
    })
    .filter(Boolean);

  GT.registry.vendorMarketAssignments[vendorKey] =
    Array.from(new Set(normalizedMarkets));

  return GT.registry.vendorMarketAssignments[vendorKey];
};


/* ------------------------------------------------------------
 * Market → Country assignment
 * ------------------------------------------------------------ */

GT.assignCountriesToMarket = function (
  marketId,
  countries
) {

  var marketKey = GT.normalizeId(marketId);

  if (!marketKey) {
    return [];
  }

  if (!Array.isArray(countries)) {
    countries = [countries];
  }

  var normalizedCountries = countries
    .map(function (country) {
      return GT.normalizeCountry(country);
    })
    .filter(Boolean);

  GT.registry.marketCountryAssignments[marketKey] =
    Array.from(new Set(normalizedCountries));

  return GT.registry.marketCountryAssignments[marketKey];
};


/* ------------------------------------------------------------
 * Vendor → Region assignment
 * ------------------------------------------------------------ */

GT.assignVendorToRegions = function (
  vendorId,
  regions
) {

  var vendorKey = GT.normalizeId(vendorId);

  if (!vendorKey) {
    return [];
  }

  if (!Array.isArray(regions)) {
    regions = [regions];
  }

  var normalizedRegions = regions
    .map(function (region) {

      if (region && typeof region === "object") {
        return GT.normalizeId(
          region.id ||
          region.regionId ||
          region.code ||
          region.name
        );
      }

      return GT.normalizeId(region);
    })
    .filter(Boolean);

  GT.registry.vendorRegionAssignments[vendorKey] =
    Array.from(new Set(normalizedRegions));

  return GT.registry.vendorRegionAssignments[vendorKey];
};


/* ------------------------------------------------------------
 * Region → Country assignment
 * ------------------------------------------------------------ */

GT.assignCountriesToRegion = function (
  regionId,
  countries
) {

  var regionKey = GT.normalizeId(regionId);

  if (!regionKey) {
    return [];
  }

  if (!Array.isArray(countries)) {
    countries = [countries];
  }

  var normalizedCountries = countries
    .map(function (country) {
      return GT.normalizeCountry(country);
    })
    .filter(Boolean);

  GT.registry.regionCountryAssignments[regionKey] =
    Array.from(new Set(normalizedCountries));

  return GT.registry.regionCountryAssignments[regionKey];
};


/* ------------------------------------------------------------
 * Vendor coverage inspection
 * ------------------------------------------------------------ */

GT.getVendorCoverage = function (vendorId) {

  var vendorKey = GT.normalizeId(vendorId);

  return {
    vendorId: vendorKey,

    markets:
      GT.registry.vendorMarketAssignments[vendorKey] || [],

    regions:
      GT.registry.vendorRegionAssignments[vendorKey] || []
  };
};


/* ------------------------------------------------------------
 * Market country inspection
 * ------------------------------------------------------------ */

GT.getMarketCountries = function (marketId) {

  var marketKey = GT.normalizeId(marketId);

  return GT.registry.marketCountryAssignments[marketKey] || [];
};


/* ------------------------------------------------------------
 * Market → Country eligibility
 * ------------------------------------------------------------ */

GT.checkMarketCountryEligibility = function (
  marketId,
  deliveryCountry
) {

  var marketKey = GT.normalizeId(marketId);
  var country = GT.normalizeCountry(deliveryCountry);

  if (!marketKey || !country) {
    return {
      status: "unknown",
      marketId: marketKey,
      deliveryCountry: country,
      reason: "Missing market or delivery country."
    };
  }

  var market =
    GT.registry.markets[marketKey];

  if (!market) {
    return {
      status: "unknown",
      marketId: marketKey,
      deliveryCountry: country,
      reason: "Market data is unavailable."
    };
  }

  var countries =
    GT.registry.marketCountryAssignments[marketKey];

  if (!Array.isArray(countries)) {
    return {
      status: "unknown",
      marketId: marketKey,
      deliveryCountry: country,
      reason: "Market country coverage is unavailable."
    };
  }

  if (countries.indexOf(country) !== -1) {
    return {
      status: "eligible",
      marketId: marketKey,
      deliveryCountry: country,
      reason: "Destination country is covered by the market."
    };
  }

  return {
    status: "not_eligible",
    marketId: marketKey,
    deliveryCountry: country,
    reason: "Destination country is not covered by the market."
  };
};


/* ------------------------------------------------------------
 * Vendor → Market → Country eligibility
 *
 * This is the important corrected relationship.
 *
 * We DO NOT compare:
 *
 *     deliveryCountry === vendorMarket
 *
 * Instead:
 *
 *     vendor
 *       ↓
 *     assigned market(s)
 *       ↓
 *     market country coverage
 *       ↓
 *     delivery country
 * ------------------------------------------------------------ */

GT.checkVendorCountryEligibility = function (
  vendorId,
  deliveryCountry
) {

  var vendorKey = GT.normalizeId(vendorId);
  var country = GT.normalizeCountry(deliveryCountry);

  if (!vendorKey || !country) {
    return {
      status: "unknown",
      vendorId: vendorKey,
      deliveryCountry: country,
      reason: "Missing vendor or delivery country."
    };
  }

  var vendor =
    GT.registry.vendors[vendorKey];

  if (!vendor) {
    return {
      status: "unknown",
      vendorId: vendorKey,
      deliveryCountry: country,
      reason: "Vendor data is unavailable."
    };
  }

  var markets =
    GT.registry.vendorMarketAssignments[vendorKey];

  if (!Array.isArray(markets)) {
    return {
      status: "unknown",
      vendorId: vendorKey,
      deliveryCountry: country,
      reason: "Vendor market assignments are unavailable."
    };
  }

  if (markets.length === 0) {
    return {
      status: "unknown",
      vendorId: vendorKey,
      deliveryCountry: country,
      reason: "Vendor has no resolved market assignments."
    };
  }

  var evaluatedMarkets = [];
  var hasUnknownCoverage = false;

  for (var i = 0; i < markets.length; i++) {

    var marketId = markets[i];

    var result =
      GT.checkMarketCountryEligibility(
        marketId,
        country
      );

    evaluatedMarkets.push(result);

    if (result.status === "eligible") {

      return {
        status: "eligible",
        vendorId: vendorKey,
        deliveryCountry: country,
        matchedMarketId: marketId,
        evaluatedMarkets: evaluatedMarkets,
        reason:
          "Vendor has a market covering the destination country."
      };
    }

    if (result.status === "unknown") {
      hasUnknownCoverage = true;
    }
  }

  if (hasUnknownCoverage) {

    return {
      status: "unknown",
      vendorId: vendorKey,
      deliveryCountry: country,
      evaluatedMarkets: evaluatedMarkets,
      reason:
        "Available vendor market data does not establish destination eligibility."
    };
  }

  return {
    status: "not_eligible",
    vendorId: vendorKey,
    deliveryCountry: country,
    evaluatedMarkets: evaluatedMarkets,
    reason:
      "No assigned vendor market covers the destination country."
  };
};


/* ------------------------------------------------------------
 * Product → Vendor → Destination eligibility
 * ------------------------------------------------------------ */

GT.checkProductSupplierEligibility = function (
  product,
  deliveryCountry
) {

  if (!product) {
    return {
      status: "unknown",
      deliveryCountry:
        GT.normalizeCountry(deliveryCountry),
      reason: "Product data is unavailable."
    };
  }

  var vendorId =
    product.vendorId ||
    product.vendor ||
    product.brand;

  if (!vendorId) {
    return {
      status: "unknown",
      deliveryCountry:
        GT.normalizeCountry(deliveryCountry),
      reason: "Product vendor is unavailable."
    };
  }

  return GT.checkVendorCountryEligibility(
    vendorId,
    deliveryCountry
  );
};


/* ------------------------------------------------------------
 * Shipping result
 *
 * GodreryTone's business rule:
 *
 * eligible:
 *   free shipping
 *   shipping fee = 0
 *
 * unknown:
 *   do not invent shipping information
 *
 * not eligible:
 *   product should not be presented as available for that
 *   destination.
 * ------------------------------------------------------------ */

GT.buildShippingResult = function (
  eligibility
) {

  if (!eligibility) {
    return {
      eligibility: "unknown",
      shippingType: null,
      shippingFee: null,
      shippingCurrency: null
    };
  }

  if (eligibility.status === "eligible") {

    return {
      eligibility: "eligible",
      shippingType: "free",
      shippingFee: 0,
      shippingCurrency: null
    };
  }

  if (eligibility.status === "not_eligible") {

    return {
      eligibility: "not_eligible",
      shippingType: null,
      shippingFee: null,
      shippingCurrency: null
    };
  }

  return {
    eligibility: "unknown",
    shippingType: null,
    shippingFee: null,
    shippingCurrency: null
  };
};


/* ------------------------------------------------------------
 * Registry status
 * ------------------------------------------------------------ */

GT.getRegistryStatus = function () {

  return {
    vendors:
      Object.keys(GT.registry.vendors).length,

    markets:
      Object.keys(GT.registry.markets).length,

    regions:
      Object.keys(GT.registry.regions).length,

    products:
      Object.keys(GT.registry.products).length,

    vendorMarketAssignments:
      Object.keys(
        GT.registry.vendorMarketAssignments
      ).length,

    marketCountryAssignments:
      Object.keys(
        GT.registry.marketCountryAssignments
      ).length,

    vendorRegionAssignments:
      Object.keys(
        GT.registry.vendorRegionAssignments
      ).length,

    regionCountryAssignments:
      Object.keys(
        GT.registry.regionCountryAssignments
      ).length
  };
};


console.info(
  "[GodreryTone WebMCP] Bit 1 registry initialized."
);


/* ============================================================
 * BIT 1B — DYNAMIC COMMERCE DATA ACCESS / RESOLUTION LAYER
 *
 * PURPOSE:
 *
 * Bit 1 owns the rules and normalized registry.
 *
 * Bit 1B is responsible for:
 *
 * 1. Getting commerce data from the configured data source.
 * 2. Resolving commerce data into Bit 1's registry.
 * 3. Providing SHARED currency / FX infrastructure.
 * 4. Providing the fixed GodreryTone FX snapshot used by
 *    all downstream tools that require currency conversion.
 *
 *
 * ============================================================
 * FX / CURRENCY ARCHITECTURE
 * ============================================================
 *
 * GodreryTone's base commerce currency is USD.
 *
 * The project currently uses a FIXED FX SNAPSHOT:
 *
 *     Rate date: 2026-08-28
 *     Source: XE Historical Currency Tables
 *     Rate type: mid-market
 *
 * The supplied rates use this direction:
 *
 *     1 USD = X units of currency
 *
 * Example:
 *
 *     USD → KES
 *
 *     1 USD = 129.408567712 KES
 *
 *
 * For cross-currency conversion:
 *
 *     FROM → USD → TO
 *
 * If:
 *
 *     1 USD = 0.8621964925 EUR
 *     1 USD = 129.408567712 KES
 *
 * Then:
 *
 *     EUR → KES
 *
 *     rate = 129.408567712 / 0.8621964925
 *
 *
 * IMPORTANT:
 *
 * The fixed FX snapshot is intentionally centralized here.
 *
 * Downstream tools MUST NOT contain their own FX tables.
 *
 * Downstream tools call:
 *
 *     GT.currency.toUSD()
 *
 * or:
 *
 *     GT.currency.fromUSD()
 *
 * or:
 *
 *     GT.currency.convert()
 *
 *
 * #7 BUDGET
 *     Customer currency → USD
 *
 *
 * #9 MARKET-AWARE PRICING
 *     USD → Customer currency
 *
 *
 * #11 CUSTOMER PURCHASE DECISION
 *     Verifies the converted customer-facing price.
 *
 *
 * #12 FINAL INTEGRATION
 *     Verifies that the customer-facing price is ready.
 *
 *
 * ============================================================
 * IMPORTANT
 * ============================================================
 *
 * DO NOT hardcode:
 *
 * - current vendors
 * - current products
 * - current markets
 * - current countries
 * - vendor-market assignments
 * - market-country assignments
 * - product catalogue
 *
 * Those remain commerce data and must come from the configured
 * commerce data source.
 *
 *
 * FX IS DIFFERENT:
 *
 * The project has intentionally chosen a fixed historical FX
 * snapshot for the current WebMCP implementation.
 *
 * These rates are NOT represented as continuously live rates.
 *
 * They are the project's fixed FX reference data.
 *
 * ============================================================ */


/* ============================================================
 * ROOT DATA OBJECT
 * ============================================================ */

GT.data = GT.data || {};


/* ============================================================
 * DATA-SOURCE ADAPTER
 *
 * Commerce data remains externally configurable.
 *
 * FX is configured below as a built-in fixed FX adapter.
 * ============================================================ */

GT.data.adapter =
  GT.data.adapter || null;


/* ============================================================
 * GENERAL DATA CACHE
 * ============================================================ */

GT.data.cache =
  GT.data.cache || {};

GT.data.cacheTTL =
  typeof GT.data.cacheTTL === "number"
    ? GT.data.cacheTTL
    : 30000;


/* ============================================================
 * ADAPTER REGISTRATION
 * ============================================================ */

GT.data.setAdapter = function (
  adapter
) {

  if (
    !adapter ||
    typeof adapter !== "object"
  ) {

    GT.data.adapter = null;

    return {
      status: "not_configured"
    };
  }

  GT.data.adapter = adapter;

  GT.data.clearCache();

  return {
    status: "configured"
  };
};


/* ============================================================
 * CACHE HELPERS
 * ============================================================ */

GT.data.clearCache = function () {

  GT.data.cache = {};

  return true;
};


GT.data.getCached = function (
  key
) {

  var item =
    GT.data.cache[key];

  if (!item) {
    return null;
  }

  if (
    Date.now() -
    item.timestamp >
    GT.data.cacheTTL
  ) {

    delete GT.data.cache[key];

    return null;
  }

  return item.value;
};


GT.data.setCached = function (
  key,
  value
) {

  GT.data.cache[key] = {
    timestamp: Date.now(),
    value: value
  };

  return value;
};


/* ============================================================
 * FIXED FX SNAPSHOT
 *
 * SOURCE DATA SUPPLIED FOR GODRERYTONE
 *
 * RATE CONVENTION:
 *
 *     1 USD = X currency
 *
 * NULL RATE:
 *
 * A null rate means the supplied snapshot does not provide
 * a usable conversion rate for that currency.
 *
 * Such currencies are NOT fabricated or estimated.
 * Conversion returns "unknown" when requested.
 * ============================================================ */

GT.currency =
  GT.currency || {};


GT.currency.fixedFX =
  {
    meta: {
      rateDate: "2026-08-28",
      weekStart: "2026-08-24",
      weekEnd: "2026-08-30",
      baseCurrency: "USD",
      direction: "1 USD = X currency",
      countryCount: 195,
      rateType: "mid-market",
      source: "XE Historical Currency Tables",
      sourceTimestamp: "2026-08-28T16:00:00Z"
    },

    countries: {

      AF: {
        name: "Afghanistan",
        currency: "AFN",
        rate: 65.9500338361
      },

      AL: {
        name: "Albania",
        currency: "ALL",
        rate: 79.4496479984
      },

      DZ: {
        name: "Algeria",
        currency: "DZD",
        rate: 133.266061626
      },

      AD: {
        name: "Andorra",
        currency: "EUR",
        rate: 0.8621964925
      },

      AO: {
        name: "Angola",
        currency: "AOA",
        rate: 916.728914135
      },

      AG: {
        name: "Antigua and Barbuda",
        currency: "XCD",
        rate: 2.7072850822
      },

      AR: {
        name: "Argentina",
        currency: "ARS",
        rate: 1513.451988895
      },

      AM: {
        name: "Armenia",
        currency: "AMD",
        rate: 364.319233479
      },

      AU: {
        name: "Australia",
        currency: "AUD",
        rate: 1.3957020578
      },

      AT: {
        name: "Austria",
        currency: "EUR",
        rate: 0.8621964925
      },

      AZ: {
        name: "Azerbaijan",
        currency: "AZN",
        rate: 1.6999984541
      },


      BS: {
        name: "Bahamas",
        currency: "BSD",
        rate: 1.0
      },

      BH: {
        name: "Bahrain",
        currency: "BHD",
        rate: 0.376
      },

      BD: {
        name: "Bangladesh",
        currency: "BDT",
        rate: 123.283188480
      },

      BB: {
        name: "Barbados",
        currency: "BBD",
        rate: 2.0
      },

      BY: {
        name: "Belarus",
        currency: "BYN",
        rate: null
      },

      BE: {
        name: "Belgium",
        currency: "EUR",
        rate: 0.8621964925
      },

      BZ: {
        name: "Belize",
        currency: "BZD",
        rate: 2.0133055191
      },

      BJ: {
        name: "Benin",
        currency: "XOF",
        rate: 565.563824601
      },

      BT: {
        name: "Bhutan",
        currency: "BTN",
        rate: 95.579409118
      },

      BO: {
        name: "Bolivia",
        currency: "BOB",
        rate: 11.634086174
      },

      BA: {
        name: "Bosnia and Herzegovina",
        currency: "BAM",
        rate: 1.6863097658
      },

      BW: {
        name: "Botswana",
        currency: "BWP",
        rate: 13.389643792
      },

      BR: {
        name: "Brazil",
        currency: "BRL",
        rate: 5.2153391341
      },

      BN: {
        name: "Brunei",
        currency: "BND",
        rate: 1.2745172968
      },

      BG: {
        name: "Bulgaria",
        currency: "EUR",
        rate: 0.8621964925
      },

      BF: {
        name: "Burkina Faso",
        currency: "XOF",
        rate: 565.563824601
      },

      BI: {
        name: "Burundi",
        currency: "BIF",
        rate: 2986.889140001
      },


      CV: {
        name: "Cabo Verde",
        currency: "CVE",
        rate: 95.074407223
      },

      KH: {
        name: "Cambodia",
        currency: "KHR",
        rate: 4047.471356805
      },

      CM: {
        name: "Cameroon",
        currency: "XAF",
        rate: 565.563824601
      },

      CA: {
        name: "Canada",
        currency: "CAD",
        rate: 1.3897236261
      },

      CF: {
        name: "Central African Republic",
        currency: "XAF",
        rate: 565.563824601
      },

      TD: {
        name: "Chad",
        currency: "XAF",
        rate: 565.563824601
      },

      CL: {
        name: "Chile",
        currency: "CLP",
        rate: 928.352592814
      },

      CN: {
        name: "China",
        currency: "CNY",
        rate: 6.7273822717
      },

      CO: {
        name: "Colombia",
        currency: "COP",
        rate: 3206.226618223
      },

      KM: {
        name: "Comoros",
        currency: "KMF",
        rate: 424.172868451
      },

      CD: {
        name: "Democratic Republic of the Congo",
        currency: "CDF",
        rate: 2294.917490771
      },

      CG: {
        name: "Republic of the Congo",
        currency: "XAF",
        rate: 565.563824601
      },

      CR: {
        name: "Costa Rica",
        currency: "CRC",
        rate: 453.292184964
      },

      CI: {
        name: "Côte d'Ivoire",
        currency: "XOF",
        rate: 565.563824601
      },

      HR: {
        name: "Croatia",
        currency: "EUR",
        rate: 0.8621964925
      },

      CU: {
        name: "Cuba",
        currency: "CUP",
        rate: null
      },

      CY: {
        name: "Cyprus",
        currency: "EUR",
        rate: 0.8621964925
      },

      CZ: {
        name: "Czechia",
        currency: "CZK",
        rate: 20.810840730
      },


      DK: {
        name: "Denmark",
        currency: "DKK",
        rate: 6.4452663932
      },

      DJ: {
        name: "Djibouti",
        currency: "DJF",
        rate: 178.210436090
      },

      DM: {
        name: "Dominica",
        currency: "XCD",
        rate: 2.7072850822
      },

      DO: {
        name: "Dominican Republic",
        currency: "DOP",
        rate: 58.7166230455
      },


      EC: {
        name: "Ecuador",
        currency: "USD",
        rate: 1.0
      },

      EG: {
        name: "Egypt",
        currency: "EGP",
        rate: 50.249246629
      },

      SV: {
        name: "El Salvador",
        currency: "USD",
        rate: 1.0
      },

      GQ: {
        name: "Equatorial Guinea",
        currency: "XAF",
        rate: 565.563824601
      },

      ER: {
        name: "Eritrea",
        currency: "ERN",
        rate: 15.0
      },

      EE: {
        name: "Estonia",
        currency: "EUR",
        rate: 0.8621964925
      },

      SZ: {
        name: "Eswatini",
        currency: "SZL",
        rate: 16.133711877
      },

      ET: {
        name: "Ethiopia",
        currency: "ETB",
        rate: 163.100374071
      },


      FJ: {
        name: "Fiji",
        currency: "FJD",
        rate: 2.198687282
      },

      FI: {
        name: "Finland",
        currency: "EUR",
        rate: 0.8621964925
      },

      FR: {
        name: "France",
        currency: "EUR",
        rate: 0.8621964925
      },


      GA: {
        name: "Gabon",
        currency: "XAF",
        rate: 565.563824601
      },

      GM: {
        name: "Gambia",
        currency: "GMD",
        rate: 75.030458360
      },

      GE: {
        name: "Georgia",
        currency: "GEL",
        rate: 2.604784158
      },

      DE: {
        name: "Germany",
        currency: "EUR",
        rate: 0.8621964925
      },

      GH: {
        name: "Ghana",
        currency: "GHS",
        rate: 11.224956161
      },

      GR: {
        name: "Greece",
        currency: "EUR",
        rate: 0.8621964925
      },

      GD: {
        name: "Grenada",
        currency: "XCD",
        rate: 2.7072850822
      },

      GT: {
        name: "Guatemala",
        currency: "GTQ",
        rate: 7.632114281
      },

      GN: {
        name: "Guinea",
        currency: "GNF",
        rate: 8797.145214
      },

      GW: {
        name: "Guinea-Bissau",
        currency: "XOF",
        rate: 565.563824601
      },

      GY: {
        name: "Guyana",
        currency: "GYD",
        rate: 209.230618627
      },


      HT: {
        name: "Haiti",
        currency: "HTG",
        rate: 130.861337202
      },

      HN: {
        name: "Honduras",
        currency: "HNL",
        rate: 26.858466867
      },

      HU: {
        name: "Hungary",
        currency: "HUF",
        rate: 314.854884214
      },


      IS: {
        name: "Iceland",
        currency: "ISK",
        rate: 121.228160955
      },

      IN: {
        name: "India",
        currency: "INR",
        rate: 95.579409118
      },

      ID: {
        name: "Indonesia",
        currency: "IDR",
        rate: 17752.666644
      },

      IR: {
        name: "Iran",
        currency: "IRR",
        rate: null
      },

      IQ: {
        name: "Iraq",
        currency: "IQD",
        rate: 1310.286289788
      },

      IE: {
        name: "Ireland",
        currency: "EUR",
        rate: 0.8621964925
      },

      IL: {
        name: "Israel",
        currency: "ILS",
        rate: 2.9870860201
      },

      IT: {
        name: "Italy",
        currency: "EUR",
        rate: 0.8621964925
      },


      JM: {
        name: "Jamaica",
        currency: "JMD",
        rate: 158.524658122
      },

      JP: {
        name: "Japan",
        currency: "JPY",
        rate: 159.970636660
      },

      JO: {
        name: "Jordan",
        currency: "JOD",
        rate: 0.709
      },


      KZ: {
        name: "Kazakhstan",
        currency: "KZT",
        rate: 464.041257793
      },

      KE: {
        name: "Kenya",
        currency: "KES",
        rate: 129.408567712
      },

      KI: {
        name: "Kiribati",
        currency: "AUD",
        rate: 1.3957020578
      },

      KW: {
        name: "Kuwait",
        currency: "KWD",
        rate: 0.3088805741
      },

      KG: {
        name: "Kyrgyzstan",
        currency: "KGS",
        rate: 87.545987897
      },


      LA: {
        name: "Laos",
        currency: "LAK",
        rate: 22436.554044
      },

      LV: {
        name: "Latvia",
        currency: "EUR",
        rate: 0.8621964925
      },

      LB: {
        name: "Lebanon",
        currency: "LBP",
        rate: 89700.287583
      },

      LS: {
        name: "Lesotho",
        currency: "LSL",
        rate: 16.133711877
      },

      LR: {
        name: "Liberia",
        currency: "LRD",
        rate: 180.691872232
      },

      LY: {
        name: "Libya",
        currency: "LYD",
        rate: 6.338940115
      },

      LI: {
        name: "Liechtenstein",
        currency: "CHF",
        rate: 0.8085323914
      },

      LT: {
        name: "Lithuania",
        currency: "EUR",
        rate: 0.8621964925
      },

      LU: {
        name: "Luxembourg",
        currency: "EUR",
        rate: 0.8621964925
      },


      MG: {
        name: "Madagascar",
        currency: "MGA",
        rate: 4315.387858718
      },

      MW: {
        name: "Malawi",
        currency: "MWK",
        rate: 1733.837951261
      },

      MY: {
        name: "Malaysia",
        currency: "MYR",
        rate: 4.0258820118
      },

      MV: {
        name: "Maldives",
        currency: "MVR",
        rate: 15.459583851
      },

      ML: {
        name: "Mali",
        currency: "XOF",
        rate: 565.563824601
      },

      MT: {
        name: "Malta",
        currency: "EUR",
        rate: 0.8621964925
      },

      MH: {
        name: "Marshall Islands",
        currency: "USD",
        rate: 1.0
      },

      MR: {
        name: "Mauritania",
        currency: "MRU",
        rate: 40.044701636
      },

      MU: {
        name: "Mauritius",
        currency: "MUR",
        rate: 46.865409084
      },

      MX: {
        name: "Mexico",
        currency: "MXN",
        rate: 17.038984880
      },

      FM: {
        name: "Micronesia",
        currency: "USD",
        rate: 1.0
      },

      MD: {
        name: "Moldova",
        currency: "MDL",
        rate: 17.192555820
      },

      MC: {
        name: "Monaco",
        currency: "EUR",
        rate: 0.8621964925
      },

      MN: {
        name: "Mongolia",
        currency: "MNT",
        rate: 3597.739732373
      },

      ME: {
        name: "Montenegro",
        currency: "EUR",
        rate: 0.8621964925
      },

      MA: {
        name: "Morocco",
        currency: "MAD",
        rate: 9.289197210
      },

      MZ: {
        name: "Mozambique",
        currency: "MZN",
        rate: 63.817260458
      },

      MM: {
        name: "Myanmar",
        currency: "MMK",
        rate: 2099.727459364
      },


      NA: {
        name: "Namibia",
        currency: "NAD",
        rate: 16.133711877
      },

      NR: {
        name: "Nauru",
        currency: "AUD",
        rate: 1.3957020578
      },

      NP: {
        name: "Nepal",
        currency: "NPR",
        rate: 152.998739145
      },

      NL: {
        name: "Netherlands",
        currency: "EUR",
        rate: 0.8621964925
      },

      NZ: {
        name: "New Zealand",
        currency: "NZD",
        rate: 1.6909716314
      },

      NI: {
        name: "Nicaragua",
        currency: "NIO",
        rate: 36.760606902
      },

      NE: {
        name: "Niger",
        currency: "XOF",
        rate: 565.563824601
      },

      NG: {
        name: "Nigeria",
        currency: "NGN",
        rate: 1339.693540135
      },

      KP: {
        name: "North Korea",
        currency: "KPW",
        rate: null
      },

      MK: {
        name: "North Macedonia",
        currency: "MKD",
        rate: 52.804058950
      },

      NO: {
        name: "Norway",
        currency: "NOK",
        rate: 9.380139019
      },


      OM: {
        name: "Oman",
        currency: "OMR",
        rate: 0.3846324074
      },


      PK: {
        name: "Pakistan",
        currency: "PKR",
        rate: 277.488730592
      },

      PW: {
        name: "Palau",
        currency: "USD",
        rate: 1.0
      },

      PS: {
        name: "Palestine",
        currency: "ILS",
        rate: 2.9870860201
      },

      PA: {
        name: "Panama",
        currency: "PAB",
        rate: 1.0
      },

      PG: {
        name: "Papua New Guinea",
        currency: "PGK",
        rate: 4.4344868643
      },

      PY: {
        name: "Paraguay",
        currency: "PYG",
        rate: 5924.732260008
      },

      PE: {
        name: "Peru",
        currency: "PEN",
        rate: 3.3516404238
      },

      PH: {
        name: "Philippines",
        currency: "PHP",
        rate: 62.370569945
      },

      PL: {
        name: "Poland",
        currency: "PLN",
        rate: 3.7434663793
      },

      PT: {
        name: "Portugal",
        currency: "EUR",
        rate: 0.8621964925
      },


      QA: {
        name: "Qatar",
        currency: "QAR",
        rate: 3.64
      },


      RO: {
        name: "Romania",
        currency: "RON",
        rate: 4.533615952
      },

      RU: {
        name: "Russia",
        currency: "RUB",
        rate: null
      },

      RW: {
        name: "Rwanda",
        currency: "RWF",
        rate: 1471.276512022
      },


      KN: {
        name: "Saint Kitts and Nevis",
        currency: "XCD",
        rate: 2.7072850822
      },

      LC: {
        name: "Saint Lucia",
        currency: "XCD",
        rate: 2.7072850822
      },

      VC: {
        name: "Saint Vincent and the Grenadines",
        currency: "XCD",
        rate: 2.7072850822
      },

      WS: {
        name: "Samoa",
        currency: "WST",
        rate: 2.7078335575
      },

      SM: {
        name: "San Marino",
        currency: "EUR",
        rate: 0.8621964925
      },

      ST: {
        name: "São Tomé and Príncipe",
        currency: "STN",
        rate: 21.343592459
      },

      SA: {
        name: "Saudi Arabia",
        currency: "SAR",
        rate: 3.75
      },

      SN: {
        name: "Senegal",
        currency: "XOF",
        rate: 565.563824601
      },

      RS: {
        name: "Serbia",
        currency: "RSD",
        rate: 101.161322234
      },

      SC: {
        name: "Seychelles",
        currency: "SCR",
        rate: 14.108446443
      },

      SL: {
        name: "Sierra Leone",
        currency: "SLE",
        rate: null
      },

      SG: {
        name: "Singapore",
        currency: "SGD",
        rate: 1.2745172968
      },

      SK: {
        name: "Slovakia",
        currency: "EUR",
        rate: 0.8621964925
      },

      SI: {
        name: "Slovenia",
        currency: "EUR",
        rate: 0.8621964925
      },

      SB: {
        name: "Solomon Islands",
        currency: "SBD",
        rate: 7.9973926205
      },

      SO: {
        name: "Somalia",
        currency: "SOS",
        rate: 570.915139680
      },

      ZA: {
        name: "South Africa",
        currency: "ZAR",
        rate: 16.133711877
      },

      KR: {
        name: "South Korea",
        currency: "KRW",
        rate: 1379.593756031
      },

      SS: {
        name: "South Sudan",
        currency: "SSP",
        rate: null
      },

      ES: {
        name: "Spain",
        currency: "EUR",
        rate: 0.8621964925
      },

      LK: {
        name: "Sri Lanka",
        currency: "LKR",
        rate: 328.020035520
      },

      SD: {
        name: "Sudan",
        currency: "SDG",
        rate: 600.216524573
      },

      SR: {
        name: "Suriname",
        currency: "SRD",
        rate: 37.755992420
      },

      SE: {
        name: "Sweden",
        currency: "SEK",
        rate: 9.595512292
      },

      CH: {
        name: "Switzerland",
        currency: "CHF",
        rate: 0.8085323914
      },

      SY: {
        name: "Syria",
        currency: "SYP",
        rate: null
      },


      TJ: {
        name: "Tajikistan",
        currency: "TJS",
        rate: 9.243266440
      },

      TZ: {
        name: "Tanzania",
        currency: "TZS",
        rate: 2645.418525661
      },

      TH: {
        name: "Thailand",
        currency: "THB",
        rate: 33.118269442
      },

      TL: {
        name: "Timor-Leste",
        currency: "USD",
        rate: 1.0
      },

      TG: {
        name: "Togo",
        currency: "XOF",
        rate: 565.563824601
      },

      TO: {
        name: "Tonga",
        currency: "TOP",
        rate: 2.407002044
      },

      TT: {
        name: "Trinidad and Tobago",
        currency: "TTD",
        rate: 6.783060112
      },

      TN: {
        name: "Tunisia",
        currency: "TND",
        rate: 2.911462697
      },

      TR: {
        name: "Türkiye",
        currency: "TRY",
        rate: 48.247133520
      },

      TM: {
        name: "Turkmenistan",
        currency: "TMT",
        rate: 3.497909448
      },

      TV: {
        name: "Tuvalu",
        currency: "AUD",
        rate: 1.3957020578
      },


      UG: {
        name: "Uganda",
        currency: "UGX",
        rate: 3768.685534054
      },

      UA: {
        name: "Ukraine",
        currency: "UAH",
        rate: 44.624536757
      },

      AE: {
        name: "United Arab Emirates",
        currency: "AED",
        rate: 3.6725
      },

      GB: {
        name: "United Kingdom",
        currency: "GBP",
        rate: 0.7378079686
      },

      US: {
        name: "United States",
        currency: "USD",
        rate: 1.0
      },

      UY: {
        name: "Uruguay",
        currency: "UYU",
        rate: 40.282600718
      },

      UZ: {
        name: "Uzbekistan",
        currency: "UZS",
        rate: 11817.550304897
      },


      VU: {
        name: "Vanuatu",
        currency: "VUV",
        rate: 118.250696417
      },

      VA: {
        name: "Vatican City",
        currency: "EUR",
        rate: 0.8621964925
      },

      VE: {
        name: "Venezuela",
        currency: "VES",
        rate: 790.276526818
      },

      VN: {
        name: "Vietnam",
        currency: "VND",
        rate: 26090.031128469
      },


      YE: {
        name: "Yemen",
        currency: "YER",
        rate: 236.685387735
      },


      ZM: {
        name: "Zambia",
        currency: "ZMW",
        rate: 19.067036709
      },

      ZW: {
        name: "Zimbabwe",
        currency: "ZWG",
        rate: null
      }

    }
  };


/* ============================================================
 * BUILD CURRENCY RATE INDEX
 *
 * Converts the supplied country dataset into:
 *
 *     currency → USD-base rate
 *
 * Example:
 *
 *     KES → 129.408567712
 *     EUR → 0.8621964925
 *     GBP → 0.7378079686
 *
 * This means:
 *
 *     1 USD = rate units of currency.
 *
 * Multiple countries using the same currency naturally share
 * the same FX rate.
 * ============================================================ */

GT.currency.fixedFXRates =
  GT.currency.fixedFXRates || {};


(function () {

  var countries =
    GT.currency.fixedFX.countries;

  Object.keys(countries).forEach(
    function (countryCode) {

      var entry =
        countries[countryCode];

      if (
        !entry ||
        typeof entry.currency !== "string"
      ) {
        return;
      }

      var currency =
        entry.currency
          .trim()
          .toUpperCase();

      if (
        !/^[A-Z]{3}$/.test(currency)
      ) {
        return;
      }

      /*
       * Only store usable numeric rates.
       *
       * A null rate remains unavailable.
       */
      if (
        typeof entry.rate === "number" &&
        Number.isFinite(entry.rate) &&
        entry.rate > 0
      ) {

        /*
         * Do not overwrite an already established rate.
         *
         * The supplied dataset uses consistent rates for
         * currencies shared by multiple countries.
         */
        if (
          typeof GT.currency.fixedFXRates[currency] !==
          "number"
        ) {

          GT.currency.fixedFXRates[currency] =
            entry.rate;
        }
      }

    }
  );

})();


/*
 * USD is always the base currency.
 */

GT.currency.fixedFXRates.USD = 1;


/* ============================================================
 * CURRENCY NORMALIZATION
 * ============================================================ */

GT.currency.normalizeCode = function (
  currency
) {

  if (
    typeof currency !== "string"
  ) {

    return null;
  }

  var code =
    currency
      .trim()
      .toUpperCase();

  if (
    !/^[A-Z]{3}$/.test(code)
  ) {

    return null;
  }

  return code;
};


/* ============================================================
 * FX RATE VALIDATION
 * ============================================================ */

GT.currency.isValidRate = function (
  rate
) {

  return (
    typeof rate === "number" &&
    Number.isFinite(rate) &&
    rate > 0
  );
};


/* ============================================================
 * FIXED FX SNAPSHOT LOOKUP
 *
 * Returns the project's fixed USD-base rate.
 *
 * Convention:
 *
 *     1 USD = X currency
 * ============================================================ */

GT.currency.getFixedRate = function (
  currency
) {

  var code =
    GT.currency.normalizeCode(
      currency
    );

  if (!code) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Invalid currency code."
    };
  }


  var rate =
    GT.currency.fixedFXRates[code];


  if (
    !GT.currency.isValidRate(rate)
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Fixed exchange rate is unavailable for " +
        code +
        "."
    };
  }


  return {
    status: "ok",
    data: {
      rate: rate,
      currency: code,
      baseCurrency: "USD",
      direction: "1 USD = X currency",
      rateDate:
        GT.currency.fixedFX.meta.rateDate,
      timestamp:
        GT.currency.fixedFX.meta.sourceTimestamp,
      source:
        GT.currency.fixedFX.meta.source,
      rateType:
        GT.currency.fixedFX.meta.rateType,
      verified: true
    }
  };
};


/* ============================================================
 * FX CACHE
 * ============================================================ */

GT.data.fxCache =
  GT.data.fxCache || {};

GT.data.fxCacheTTL =
  typeof GT.data.fxCacheTTL === "number"
    ? GT.data.fxCacheTTL
    : 30000;


/* ============================================================
 * FX CACHE HELPERS
 * ============================================================ */

GT.data.getCachedFX = function (
  key
) {

  var item =
    GT.data.fxCache[key];

  if (!item) {
    return null;
  }

  if (
    Date.now() -
    item.timestamp >
    GT.data.fxCacheTTL
  ) {

    delete GT.data.fxCache[key];

    return null;
  }

  return item.value;
};


GT.data.setCachedFX = function (
  key,
  value
) {

  GT.data.fxCache[key] = {
    timestamp: Date.now(),
    value: value
  };

  return value;
};


/* ============================================================
 * GENERIC ADAPTER INVOCATION
 *
 * This remains the common gateway for commerce data and FX.
 * ============================================================ */

GT.data.invoke = async function (
  method,
  params
) {

  var adapter =
    GT.data.adapter;

  if (
    !adapter ||
    typeof adapter[method] !== "function"
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Commerce data source is not configured."
    };
  }

  try {

    var result =
      await adapter[method](
        params || {}
      );


    if (
      result &&
      typeof result === "object" &&
      "status" in result
    ) {

      return result;
    }


    return {
      status: "ok",
      data: result
    };

  } catch (error) {

    console.warn(
      "[GodreryTone WebMCP] Commerce data source error:",
      method,
      error
    );

    return {
      status: "unknown",
      data: null,
      reason:
        "Commerce data source could not be resolved."
    };
  }
};


/* ============================================================
 * FIXED FX ADAPTER
 *
 * This adapter is the FX data source for Bit 1B.
 *
 * IMPORTANT:
 *
 * It does NOT call an external API.
 *
 * It uses the centralized fixed FX snapshot above.
 *
 * All downstream currency conversions still pass through
 * GT.data.getExchangeRate().
 * ============================================================ */

GT.currency.fixedFXAdapter = {

  getExchangeRate: async function (
    params
  ) {

    var from =
      GT.currency.normalizeCode(
        params &&
        params.fromCurrency
      );

    var to =
      GT.currency.normalizeCode(
        params &&
        params.toCurrency
      );


    if (!from || !to) {

      return {
        status: "unknown",
        data: null,
        reason:
          "Invalid currency code."
      };
    }


    /*
     * Same-currency conversion.
     */

    if (from === to) {

      return {
        status: "ok",
        data: {
          rate: 1,
          fromCurrency: from,
          toCurrency: to,
          timestamp:
            GT.currency.fixedFX.meta.sourceTimestamp,
          source:
            GT.currency.fixedFX.meta.source,
          rateDate:
            GT.currency.fixedFX.meta.rateDate,
          rateType:
            GT.currency.fixedFX.meta.rateType,
          verified: true
        }
      };
    }


    /*
     * Obtain the USD-base rate for FROM.
     */

    var fromResult =
      GT.currency.getFixedRate(
        from
      );


    if (
      fromResult.status !== "ok" ||
      !fromResult.data
    ) {

      return {
        status: "unknown",
        data: null,
        reason:
          fromResult.reason ||
          "Source currency rate is unavailable."
      };
    }


    /*
     * Obtain the USD-base rate for TO.
     */

    var toResult =
      GT.currency.getFixedRate(
        to
      );


    if (
      toResult.status !== "ok" ||
      !toResult.data
    ) {

      return {
        status: "unknown",
        data: null,
        reason:
          toResult.reason ||
          "Target currency rate is unavailable."
      };
    }


    var fromUSD =
      fromResult.data.rate;

    var toUSD =
      toResult.data.rate;


    if (
      !GT.currency.isValidRate(
        fromUSD
      ) ||
      !GT.currency.isValidRate(
        toUSD
      )
    ) {

      return {
        status: "unknown",
        data: null,
        reason:
          "Fixed exchange rate is invalid."
      };
    }


    /*
     * IMPORTANT:
     *
     * Table convention:
     *
     *     1 USD = X currency
     *
     * Therefore:
     *
     *     FROM → TO
     *
     *     rate = TO rate / FROM rate
     *
     * Example:
     *
     *     USD → KES
     *
     *     129.408567712 / 1
     *
     *
     *     EUR → KES
     *
     *     129.408567712 / 0.8621964925
     */

    var rate =
      toUSD / fromUSD;


    if (
      !GT.currency.isValidRate(
        rate
      )
    ) {

      return {
        status: "unknown",
        data: null,
        reason:
          "Calculated exchange rate is invalid."
      };
    }


    return {
      status: "ok",
      data: {

        rate: rate,

        fromCurrency:
          from,

        toCurrency:
          to,

        timestamp:
          GT.currency.fixedFX.meta.sourceTimestamp,

        source:
          GT.currency.fixedFX.meta.source,

        rateDate:
          GT.currency.fixedFX.meta.rateDate,

        rateType:
          GT.currency.fixedFX.meta.rateType,

        baseCurrency:
          GT.currency.fixedFX.meta.baseCurrency,

        direction:
          GT.currency.fixedFX.meta.direction,

        verified: true

      }
    };
  }

};


/* ============================================================
 * REGISTER FIXED FX ADAPTER
 *
 * IMPORTANT:
 *
 * We intentionally merge the fixed FX adapter into the
 * commerce adapter instead of destroying an already configured
 * commerce data adapter.
 *
 * This allows:
 *
 *     commerce adapter + fixed FX
 *
 * to coexist.
 * ============================================================ */

(function () {

  var existingAdapter =
    GT.data.adapter;

  var fxAdapter =
    GT.currency.fixedFXAdapter;


  if (
    existingAdapter &&
    typeof existingAdapter === "object"
  ) {

    /*
     * Preserve the existing commerce adapter.
     *
     * Add FX only if another getExchangeRate()
     * implementation has not already been intentionally
     * configured.
     */

    if (
      typeof existingAdapter.getExchangeRate !==
      "function"
    ) {

      existingAdapter.getExchangeRate =
        fxAdapter.getExchangeRate;
    }

    GT.data.adapter =
      existingAdapter;

  } else {

    /*
     * No commerce adapter is configured yet.
     *
     * Install the fixed FX adapter so currency conversion
     * works immediately.
     *
     * Other commerce-data methods remain unavailable until
     * a legitimate commerce data source is configured.
     */

    GT.data.adapter = {

      getExchangeRate:
        fxAdapter.getExchangeRate

    };
  }

})();


/* ============================================================
 * GET EXCHANGE RATE
 *
 * Shared FX gateway.
 *
 * ALL downstream conversion must pass through here.
 * ============================================================ */

GT.data.getExchangeRate = async function (
  fromCurrency,
  toCurrency
) {

  var from =
    GT.currency.normalizeCode(
      fromCurrency
    );

  var to =
    GT.currency.normalizeCode(
      toCurrency
    );


  if (!from || !to) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Invalid currency code."
    };
  }


  /*
   * Same currency requires no FX calculation.
   */

  if (from === to) {

    return {
      status: "ok",
      data: {

        rate: 1,

        fromCurrency:
          from,

        toCurrency:
          to,

        timestamp:
          GT.currency.fixedFX.meta.sourceTimestamp,

        source:
          "same_currency",

        rateDate:
          GT.currency.fixedFX.meta.rateDate,

        rateType:
          GT.currency.fixedFX.meta.rateType,

        verified:
          true
      }
    };
  }


  var cacheKey =
    "fx:" +
    from +
    ":" +
    to;


  var cached =
    GT.data.getCachedFX(
      cacheKey
    );


  if (
    cached !== null
  ) {

    return cached;
  }


  /*
   * Request the rate through the configured adapter.
   *
   * Because the fixed FX adapter is registered above,
   * this resolves against the supplied fixed snapshot.
   */

  var result =
    await GT.data.invoke(
      "getExchangeRate",
      {
        fromCurrency:
          from,

        toCurrency:
          to
      }
    );


  if (
    result.status !== "ok" ||
    !result.data
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        result.reason ||
        "Exchange rate is unavailable."
    };
  }


  var fx =
    result.data;


  /*
   * Validate numeric rate.
   */

  if (
    !GT.currency.isValidRate(
      fx.rate
    )
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Exchange rate is invalid."
    };
  }


  /*
   * Only verified rates are accepted.
   */

  if (
    fx.verified !== true
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Exchange rate could not be verified."
    };
  }


  /*
   * Validate requested currency pair.
   */

  if (
    GT.currency.normalizeCode(
      fx.fromCurrency
    ) !== from ||

    GT.currency.normalizeCode(
      fx.toCurrency
    ) !== to
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Exchange rate currency pair does not match the requested pair."
    };
  }


  /*
   * Require a timestamp.
   */

  if (
    typeof fx.timestamp !== "string" ||
    !fx.timestamp
  ) {

    return {
      status: "unknown",
      data: null,
      reason:
        "Exchange rate timestamp is unavailable."
    };
  }


  var verifiedFX = {

    status: "ok",

    data: {

      rate:
        fx.rate,

      fromCurrency:
        from,

      toCurrency:
        to,

      timestamp:
        fx.timestamp,

      source:
        fx.source ||
        "fixed_fx_snapshot",

      rateDate:
        fx.rateDate ||
        GT.currency.fixedFX.meta.rateDate,

      rateType:
        fx.rateType ||
        GT.currency.fixedFX.meta.rateType,

      baseCurrency:
        fx.baseCurrency ||
        "USD",

      direction:
        fx.direction ||
        "1 USD = X currency",

      verified:
        true
    }
  };


  GT.data.setCachedFX(
    cacheKey,
    verifiedFX
  );


  return verifiedFX;
};


/* ============================================================
 * GENERIC CURRENCY CONVERSION
 *
 * This is the single conversion engine used by downstream
 * tools.
 * ============================================================ */

GT.currency.convert = async function (
  amount,
  fromCurrency,
  toCurrency
) {

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {

    return {
      status: "unknown",
      reason:
        "Invalid conversion amount."
    };
  }


  var from =
    GT.currency.normalizeCode(
      fromCurrency
    );

  var to =
    GT.currency.normalizeCode(
      toCurrency
    );


  if (!from || !to) {

    return {
      status: "unknown",
      reason:
        "Invalid currency code."
    };
  }


  /*
   * Obtain verified FX rate.
   */

  var rateResult =
    await GT.data.getExchangeRate(
      from,
      to
    );


  if (
    rateResult.status !== "ok" ||
    !rateResult.data
  ) {

    return {
      status: "unknown",
      reason:
        rateResult.reason ||
        "Exchange rate is unavailable."
    };
  }


  var fx =
    rateResult.data;


  var convertedAmount =
    amount * fx.rate;


  if (
    !Number.isFinite(
      convertedAmount
    )
  ) {

    return {
      status: "unknown",
      reason:
        "Currency conversion produced an invalid amount."
    };
  }


  return {

    status: "ok",

    data: {

      originalAmount:
        amount,

      originalCurrency:
        from,

      convertedAmount:
        convertedAmount,

      convertedCurrency:
        to,

      exchangeRateUsed:
        fx.rate,

      exchangeRateTimestamp:
        fx.timestamp,

      exchangeRateSource:
        fx.source,

      exchangeRateDate:
        fx.rateDate,

      exchangeRateType:
        fx.rateType,

      exchangeRateBaseCurrency:
        fx.baseCurrency,

      verified:
        fx.verified === true

    }
  };
};


/* ============================================================
 * CUSTOMER CURRENCY → USD
 *
 * USED BY:
 *
 *     #7 Budget
 *
 * Example:
 *
 *     KES 10,000
 *         ↓
 *     GT.currency.toUSD()
 *         ↓
 *     USD normalized budget
 * ============================================================ */

GT.currency.toUSD = async function (
  amount,
  currency
) {

  return GT.currency.convert(
    amount,
    currency,
    "USD"
  );
};


/* ============================================================
 * USD → CUSTOMER CURRENCY
 *
 * USED BY:
 *
 *     #9 Market-Aware Pricing
 *
 * Example:
 *
 *     USD 100
 *         ↓
 *     GT.currency.fromUSD()
 *         ↓
 *     KES customer-facing price
 * ============================================================ */

GT.currency.fromUSD = async function (
  amount,
  currency
) {

  return GT.currency.convert(
    amount,
    "USD",
    currency
  );
};


/* ============================================================
 * FX STATUS
 * ============================================================ */

GT.currency.getStatus = function () {

  var adapter =
    GT.data.adapter;


  return {

    baseCurrency:
      "USD",

    fxAdapterConfigured:
      !!(
        adapter &&
        typeof adapter.getExchangeRate ===
        "function"
      ),

    fxMode:
      "fixed_snapshot",

    fxRateDate:
      GT.currency.fixedFX.meta.rateDate,

    fxWeekStart:
      GT.currency.fixedFX.meta.weekStart,

    fxWeekEnd:
      GT.currency.fixedFX.meta.weekEnd,

    fxSource:
      GT.currency.fixedFX.meta.source,

    fxRateType:
      GT.currency.fixedFX.meta.rateType,

    fxSourceTimestamp:
      GT.currency.fixedFX.meta.sourceTimestamp,

    fxCountryCount:
      GT.currency.fixedFX.meta.countryCount,

    fxCacheTTL:
      GT.data.fxCacheTTL
  };
};


/* ============================================================
 * PRODUCTS
 * ============================================================ */

GT.data.getProducts = async function (
  params
) {

  var cacheKey =
    "products:" +
    JSON.stringify(
      params || {}
    );


  var cached =
    GT.data.getCached(
      cacheKey
    );


  if (
    cached !== null
  ) {

    return cached;
  }


  var result =
    await GT.data.invoke(
      "getProducts",
      params
    );


  if (
    result.status === "ok"
  ) {

    GT.data.setCached(
      cacheKey,
      result
    );
  }


  return result;
};


GT.data.getProduct = async function (
  params
) {

  return GT.data.invoke(
    "getProduct",
    params
  );
};


/* ============================================================
 * VENDORS
 * ============================================================ */

GT.data.getVendors = async function (
  params
) {

  var cacheKey =
    "vendors:" +
    JSON.stringify(
      params || {}
    );


  var cached =
    GT.data.getCached(
      cacheKey
    );


  if (
    cached !== null
  ) {

    return cached;
  }


  var result =
    await GT.data.invoke(
      "getVendors",
      params
    );


  if (
    result.status === "ok"
  ) {

    GT.data.setCached(
      cacheKey,
      result
    );
  }


  return result;
};


GT.data.getVendor = async function (
  params
) {

  return GT.data.invoke(
    "getVendor",
    params
  );
};


/* ============================================================
 * MARKETS
 * ============================================================ */

GT.data.getMarkets = async function (
  params
) {

  var cacheKey =
    "markets:" +
    JSON.stringify(
      params || {}
    );


  var cached =
    GT.data.getCached(
      cacheKey
    );


  if (
    cached !== null
  ) {

    return cached;
  }


  var result =
    await GT.data.invoke(
      "getMarkets",
      params
    );


  if (
    result.status === "ok"
  ) {

    GT.data.setCached(
      cacheKey,
      result
    );
  }


  return result;
};


GT.data.getMarket = async function (
  params
) {

  return GT.data.invoke(
    "getMarket",
    params
  );
};


/* ============================================================
 * MARKET COUNTRIES
 * ============================================================ */

GT.data.getMarketCountries = async function (
  params
) {

  return GT.data.invoke(
    "getMarketCountries",
    params
  );
};


/* ============================================================
 * PRODUCT MARKETS
 * ============================================================ */

GT.data.getProductMarkets = async function (
  params
) {

  return GT.data.invoke(
    "getProductMarkets",
    params
  );
};


/* ============================================================
 * VENDOR MARKETS
 * ============================================================ */

GT.data.getVendorMarkets = async function (
  params
) {

  return GT.data.invoke(
    "getVendorMarkets",
    params
  );
};


/* ============================================================
 * REGISTRY SYNCHRONIZATION
 * ============================================================ */

GT.data.syncRegistry = async function () {

  var result =
    await GT.data.invoke(
      "getCommerceRegistryData",
      {}
    );


  if (
    result.status !== "ok" ||
    !result.data
  ) {

    return {
      status: "unknown",
      reason:
        result.reason ||
        "Current commerce registry data is unavailable."
    };
  }


  var data =
    result.data;


  /* Vendors */

  if (
    Array.isArray(
      data.vendors
    )
  ) {

    data.vendors.forEach(
      function (vendor) {

        GT.registerVendor(
          vendor
        );

      }
    );
  }


  /* Markets */

  if (
    Array.isArray(
      data.markets
    )
  ) {

    data.markets.forEach(
      function (market) {

        GT.registerMarket(
          market
        );

      }
    );
  }


  /* Regions */

  if (
    Array.isArray(
      data.regions
    )
  ) {

    data.regions.forEach(
      function (region) {

        GT.registerRegion(
          region
        );

      }
    );
  }


  /* Products */

  if (
    Array.isArray(
      data.products
    )
  ) {

    data.products.forEach(
      function (product) {

        GT.registerProduct(
          product
        );

      }
    );
  }


  /* Vendor → Market */

  if (
    Array.isArray(
      data.vendorMarketAssignments
    )
  ) {

    data.vendorMarketAssignments.forEach(
      function (assignment) {

        if (!assignment) {
          return;
        }


        GT.assignVendorToMarkets(
          assignment.vendorId ||
          assignment.vendor,

          assignment.marketIds ||
          assignment.markets
        );

      }
    );
  }


  /* Market → Country */

  if (
    Array.isArray(
      data.marketCountryAssignments
    )
  ) {

    data.marketCountryAssignments.forEach(
      function (assignment) {

        if (!assignment) {
          return;
        }


        GT.assignCountriesToMarket(
          assignment.marketId ||
          assignment.market,

          assignment.countries
        );

      }
    );
  }


  /* Vendor → Region */

  if (
    Array.isArray(
      data.vendorRegionAssignments
    )
  ) {

    data.vendorRegionAssignments.forEach(
      function (assignment) {

        if (!assignment) {
          return;
        }


        GT.assignVendorToRegions(
          assignment.vendorId ||
          assignment.vendor,

          assignment.regionIds ||
          assignment.regions
        );

      }
    );
  }


  /* Region → Country */

  if (
    Array.isArray(
      data.regionCountryAssignments
    )
  ) {

    data.regionCountryAssignments.forEach(
      function (assignment) {

        if (!assignment) {
          return;
        }


        GT.assignCountriesToRegion(
          assignment.regionId ||
          assignment.region,

          assignment.countries
        );

      }
    );
  }


  return {

    status: "ok",

    registry:
      GT.getRegistryStatus()

  };
};


/* ============================================================
 * RESOLVE VENDOR DESTINATION
 * ============================================================ */

GT.data.resolveVendorDestination = async function (
  vendorId,
  deliveryCountry
) {

  var vendorMarkets =
    await GT.data.getVendorMarkets({
      vendorId:
        vendorId
    });


  if (
    vendorMarkets.status === "ok"
  ) {

    var markets =
      vendorMarkets.data;


    if (
      !Array.isArray(
        markets
      )
    ) {

      markets = [];
    }


    GT.assignVendorToMarkets(
      vendorId,
      markets
    );
  }


  return GT.checkVendorCountryEligibility(
    vendorId,
    deliveryCountry
  );
};


/* ============================================================
 * RESOLVE PRODUCT DESTINATION
 * ============================================================ */

GT.data.resolveProductDestination = async function (
  product,
  deliveryCountry
) {

  if (!product) {

    return {
      status: "unknown",
      reason:
        "Product data is unavailable."
    };
  }


  var productId =
    product.id ||
    product.productId ||
    product.handle;


  var currentProduct =
    product;


  /*
   * Prefer current product data when a commerce adapter
   * provides it.
   */

  if (
    productId
  ) {

    var productResult =
      await GT.data.getProduct({
        productId:
          productId,

        handle:
          product.handle ||
          null
      });


    if (
      productResult.status === "ok" &&
      productResult.data
    ) {

      currentProduct =
        productResult.data;
    }
  }


  /*
   * Resolve vendor.
   */

  var vendorId =
    currentProduct.vendorId ||
    currentProduct.vendor ||
    currentProduct.brand;


  if (!vendorId) {

    return {
      status: "unknown",
      reason:
        "Current product vendor could not be resolved."
    };
  }


  /*
   * Refresh product-market relationship if available.
   */

  if (
    productId
  ) {

    var productMarkets =
      await GT.data.getProductMarkets({
        productId:
          productId,

        handle:
          currentProduct.handle ||
          null
      });


    /*
     * Product-market information does not by itself
     * establish shipping eligibility.
     */

    if (
      productMarkets.status === "unknown"
    ) {

      /*
       * Do not fail immediately.
       *
       * Vendor → market → country resolution may still
       * establish eligibility.
       */
    }
  }


  return GT.data.resolveVendorDestination(
    vendorId,
    deliveryCountry
  );
};


/* ============================================================
 * FINAL SHIPPING RESOLUTION HELPER
 * ============================================================ */

GT.data.resolveShipping = async function (
  product,
  deliveryCountry
) {

  var eligibility =
    await GT.data.resolveProductDestination(
      product,
      deliveryCountry
    );


  return {

    eligibility:
      eligibility,

    shipping:
      GT.buildShippingResult(
        eligibility
      )

  };
};


/* ============================================================
 * DATA-SOURCE STATUS
 * ============================================================ */

GT.data.getStatus = function () {

  var adapter =
    GT.data.adapter;


  return {

    /*
     * A fixed FX adapter is now always available.
     */

    adapterConfigured:
      !!adapter,

    fxAdapterConfigured:
      !!(
        adapter &&
        typeof adapter.getExchangeRate ===
        "function"
      ),

    fxMode:
      "fixed_snapshot",

    fxRateDate:
      GT.currency.fixedFX.meta.rateDate,

    fxSource:
      GT.currency.fixedFX.meta.source,

    fxRateType:
      GT.currency.fixedFX.meta.rateType,

    fxSourceTimestamp:
      GT.currency.fixedFX.meta.sourceTimestamp,

    fxCountryCount:
      GT.currency.fixedFX.meta.countryCount,

    cacheTTL:
      GT.data.cacheTTL,

    fxCacheTTL:
      GT.data.fxCacheTTL,

    registry:
      GT.getRegistryStatus()

  };
};


/* ============================================================
 * INITIALIZATION MESSAGE
 * ============================================================ */

console.info(
  "[GodreryTone WebMCP] Bit 1B initialized with fixed FX snapshot:",
  GT.currency.fixedFX.meta.rateDate
);
/* =========================================================
   GODRERYTONE SHOPPING INTENT TOOL
   ========================================================= */

var shoppingIntentToolName =
  "godrerytone_shopping_intent";

var shoppingIntentSchema = {
  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request."
    },

    shoppingCountry: {
      type: "string",
      description:
        "The country or market the customer wants to shop from, when stated or clearly provided."
    },

    deliveryCountry: {
      type: "string",
      description:
        "The country where the jewellery should be delivered, when known."
    },

    category: {
      type: "string",
      description:
        "The jewellery category requested, such as necklace, earrings, bracelet, ring, pendant, anklet, brooch, or general jewellery."
    },

    style: {
      type: "string",
      description:
        "The jewellery style indicated by the customer, such as elegant, minimalist, classic, romantic, bold, luxury, casual, traditional, modern, vintage, or statement."
    },

    occasion: {
      type: "string",
      description:
        "The occasion associated with the purchase, such as anniversary, wedding, birthday, graduation, Valentine's Day, Christmas, engagement, Mother's Day, Father's Day, religious occasion, or everyday wear."
    },

    recipient: {
      type: "string",
      description:
        "The intended recipient, such as wife, husband, girlfriend, boyfriend, mother, father, daughter, son, friend, colleague, bride, groom, or self."
    },

    recipientAge: {
      type: "number",
      description:
        "The recipient's exact age when explicitly provided. Never invent an age."
    },

    recipientAgeRange: {
      type: "string",
      description:
        "The recipient's approximate age range when provided instead of an exact age."
    },

    budget: {
      type: "number",
      description:
        "The customer's stated budget amount before currency normalization."
    },

    budgetType: {
      type: "string",
      enum: [
        "maximum",
        "target",
        "flexible"
      ],
      description:
        "Whether the customer's stated budget is a maximum, target, or flexible amount."
    },

    budgetCurrency: {
      type: "string",
      description:
        "The currency explicitly associated with the customer's budget, when provided."
    },

    regionalSearch: {
      type: "boolean",
      description:
        "Initial signal indicating whether the customer appears to permit consideration of another GodreryTone market. This is only an extracted preference; the Regional Market tool is authoritative."
    },

    regionalPriority: {
      type: "string",
      enum: [
        "nearest",
        "lowest_price",
        "largest_selection",
        "best_match",
        "balanced"
      ],
      description:
        "Initial regional preference extracted from the customer's request. The Regional Market tool is authoritative."
    },

    shippingFlexibility: {
      type: "string",
      enum: [
        "current_country_only",
        "regional_delivery_ok",
        "international_delivery_ok",
        "unknown"
      ],
      description:
        "Initial indication of how flexible the customer is about delivery from another market or country."
    },

    priceSensitivity: {
      type: "string",
      enum: [
        "strict",
        "price_aware",
        "quality_first",
        "unknown"
      ],
      description:
        "Initial indication of how strongly price should influence the customer's shopping request."
    }

  },

  required: [
    "request"
  ]
};


/* =========================================================
   HELPERS
   ========================================================= */

function cleanShoppingIntentValue(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value === "string"
  ) {
    var cleaned = value.trim();

    return cleaned === ""
      ? null
      : cleaned;
  }

  return value;
}


/* =========================================================
   CREATE SHOPPING INTENT RESULT
   ========================================================= */

function createShoppingIntentResult(input) {

  input = input || {};

  return {

    success: true,

    brand: "GodreryTone",

    tool: shoppingIntentToolName,

    shoppingIntent: {

      /*
       * Original customer request.
       * This should remain available to downstream tools
       * as the source context.
       */
      request:
        cleanShoppingIntentValue(
          input.request
        ),

      /*
       * Initial extracted shopping information.
       */
      shoppingCountry:
        cleanShoppingIntentValue(
          input.shoppingCountry
        ),

      deliveryCountry:
        cleanShoppingIntentValue(
          input.deliveryCountry
        ),

      category:
        cleanShoppingIntentValue(
          input.category
        ),

      style:
        cleanShoppingIntentValue(
          input.style
        ),

      occasion:
        cleanShoppingIntentValue(
          input.occasion
        ),

      recipient:
        cleanShoppingIntentValue(
          input.recipient
        ),

      recipientAge:
        cleanShoppingIntentValue(
          input.recipientAge
        ),

      recipientAgeRange:
        cleanShoppingIntentValue(
          input.recipientAgeRange
        ),

      /*
       * Budget information is preserved as the customer's
       * original stated amount.
       *
       * It is NOT converted to USD here.
       * The Budget/Currency tool owns normalization.
       */
      budget:
        cleanShoppingIntentValue(
          input.budget
        ),

      budgetType:
        cleanShoppingIntentValue(
          input.budgetType
        ),

      budgetCurrency:
        cleanShoppingIntentValue(
          input.budgetCurrency
        ),

      /*
       * Regional information is preserved only as an
       * initial signal.
       *
       * The Regional Market tool owns regional decisions.
       */
      regionalSearch:
        input.regionalSearch === true,

      regionalPriority:
        cleanShoppingIntentValue(
          input.regionalPriority
        ) || "balanced",

      shippingFlexibility:
        cleanShoppingIntentValue(
          input.shippingFlexibility
        ) || "unknown",

      priceSensitivity:
        cleanShoppingIntentValue(
          input.priceSensitivity
        ) || "unknown"
    },


    /* =====================================================
       AUTHORITY BOUNDARIES
       ===================================================== */

    authority: {

      shoppingIntent:
        "This tool interprets and organizes the customer's initial request.",

      budget:
        "The Budget/Currency tool is authoritative for currency identification, exchange-rate conversion, USD normalization, and budget matching.",

      regionalMarket:
        "The Regional Market tool is authoritative for regional-market permissions, market selection, regional alternatives, and shipping implications.",

      catalogue:
        "The Product/Catalogue tool is authoritative for current products, product availability, catalogue matching, product-market data, and actual product prices.",

      commerceRegistry:
        "Bit 1 is authoritative for stable vendor, market, region, product, and relationship rules.",

      dynamicCommerce:
        "Bit 1B is authoritative for retrieving current commerce data and resolving dynamic commerce relationships."
    },


    /* =====================================================
       MARKET RULES
       ===================================================== */

    marketRules: {

      useCustomerChosenMarket:
        true,

      searchCustomerMarketFirst:
        true,

      compareMarketPricesSeparately:
        true,

      neverAssumeSamePriceAcrossMarkets:
        true,

      neverSilentlySwitchMarket:
        true,

      confirmDifferentShippingConditions:
        true,

      preserveOriginalCustomerCurrency:
        true,

      doNotNormalizeBudgetHere:
        true,

      doNotSelectFinalProductHere:
        true,

      doNotMakeFinalMarketDecisionHere:
        true
    },


    /* =====================================================
       AGENT GUIDANCE
       ===================================================== */

    agentGuidance: [

      "Treat the customer's complete natural-language request as the source context for the shopping journey.",

      "Extract only information that is explicitly stated or reasonably expressed by the customer.",

      "Never invent missing customer preferences.",

      "Use the customer's explicitly stated shopping country as the initial requested market.",

      "If the shopping country is unknown, do not invent one.",

      "If the delivery country is unknown, do not assume it is the same as the shopping country.",

      "Preserve the customer's original budget amount and stated currency.",

      "Do not convert the customer's budget to USD in Shopping Intent.",

      "The Budget/Currency tool must perform currency normalization before catalogue budget matching.",

      "Do not decide which product the customer should purchase.",

      "Do not claim that a product is available merely because the customer requested it.",

      "Do not assume products, prices, inventory, or shipping information.",

      "Do not silently switch the customer's market.",

      "Search the customer's selected market first.",

      "Regional-market preferences extracted here are initial signals only.",

      "The Regional Market tool is responsible for deciding whether regional alternatives may actually be considered.",

      "Catalogue availability and product matching belong to the Product/Catalogue tool.",

      "Current commerce data should be obtained through Bit 1B and evaluated using Bit 1 rules where applicable.",

      "Recipient age should only be used when the customer provides it and when it is relevant to the recommendation.",

      "Do not treat an inferred age as an exact age.",

      "Do not treat an inferred preference as an explicit customer decision.",

      "Pass the organized intent to the appropriate specialized tools before making a product recommendation."
    ],


    /* =====================================================
       DOWNSTREAM FLOW
       ===================================================== */

    nextSteps: {

      step1:
        "Use the Shopping Intent output as the initial normalized customer request.",

      step2:
        "Pass the relevant request information to the specialized Occasion, Style, Recipient, and Age tools when those dimensions are relevant.",

      step3:
        "Use the Regional Market tool to establish the customer's market and regional-search permissions.",

      step4:
        "Use the Budget/Currency tool to identify the customer's budget currency and convert the budget into USD for backend catalogue matching.",

      step5:
        "Use Bit 1B and the Product/Catalogue tool to retrieve and evaluate current catalogue products.",

      step6:
        "Return product prices to the customer in the customer's preferred currency after backend USD matching.",

      step7:
        "Present the customer with suitable products without silently changing market, price, or shipping conditions."
    },


    nextStep:
      "Pass this organized customer intent to the relevant specialized GodreryTone WebMCP tools. Regional Market should establish market context, Budget/Currency should normalize the customer's budget into USD, and Product/Catalogue should perform the actual current-product matching."
  };
}


/* =========================================================
   REGISTER TOOL
   ========================================================= */

try {

  document.modelContext.registerTool({

    name:
      shoppingIntentToolName,

    description:
      "Understand and organize a customer's natural-language GodreryTone jewellery shopping request into initial shopping signals such as category, style, occasion, recipient, recipient age, budget, currency, shopping country, delivery country, and regional preferences. This tool interprets the request but does not select products, normalize the budget into USD, make final market decisions, or claim product availability. Specialized GodreryTone tools and the commerce infrastructure remain authoritative for those decisions.",

    inputSchema:
      shoppingIntentSchema,

    execute:
      async function (input) {

        return JSON.stringify(
          createShoppingIntentResult(input)
        );

      }

  });

  console.info(
    "[GodreryTone WebMCP] shopping intent tool registered successfully."
  );

} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Shopping intent tool registration failed:",
    error
  );

}
/*
 * ============================================================
 * TOOL 2 — OCCASION
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 * Understand the customer's jewellery occasion and use that
 * occasion as a catalogue-discovery signal.
 *
 * CATALOGUE DISCOVERY MODEL
 * ------------------------------------------------------------
 * 1. Identify the customer's occasion/context.
 * 2. Inspect the CURRENT Shopify collections.
 * 3. Match the occasion/context primarily against collection
 *    title, handle, type, tags and description.
 * 4. Use collection descriptions to refine/validate the match.
 * 5. Inspect products associated with relevant collections.
 * 6. Use product metadata and descriptions as secondary
 *    refinement signals.
 * 7. Return relevant catalogue candidates.
 *
 * IMPORTANT
 * ------------------------------------------------------------
 * - Do NOT hardcode current Shopify collection names.
 * - Do NOT hardcode current products.
 * - Do NOT hardcode vendors, markets or countries.
 * - Do NOT determine destination eligibility here.
 * - Do NOT determine shipping here.
 * - Do NOT determine final pricing here.
 * - Do NOT make the purchase decision here.
 * - Do NOT claim to visually understand image pixels.
 *
 * Shopify/current catalogue data is obtained through Bit 1B.
 * ============================================================
 */

var occasionSchema = {
  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request."
    },

    occasion: {
      type: "string",
      description:
        "The customer's explicitly stated or reasonably inferred occasion, such as anniversary, wedding, birthday, graduation, Valentine's Day, Christmas, engagement, Mother's Day, Father's Day, religious occasion, music or artist event, celebration, function, special event, or everyday wear."
    },

    occasionDetails: {
      type: "string",
      description:
        "Additional occasion context explicitly provided by the customer, such as relationship, milestone, celebration type, event type, recipient role, faith context, artist or music context, or other relevant occasion details."
    },

    occasionCertainty: {
      type: "string",
      enum: [
        "explicit",
        "inferred",
        "unknown"
      ],
      description:
        "Whether the occasion was explicitly stated, reasonably inferred, or cannot be established."
    },

    catalogueDiscovery: {
      type: "boolean",
      description:
        "Whether the tool should inspect the current catalogue for collections and products relevant to the occasion. Defaults to true."
    }

  },

  required: [
    "request"
  ]
};


/*
 * ------------------------------------------------------------
 * BASIC HELPERS
 * ------------------------------------------------------------
 */

function cleanOccasionValue(value) {

  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim();

}


function normalizeOccasionCertainty(value) {

  var certainty = cleanOccasionValue(value).toLowerCase();

  if (
    certainty === "explicit" ||
    certainty === "inferred" ||
    certainty === "unknown"
  ) {
    return certainty;
  }

  return "unknown";

}


function normalizeSearchText(value) {

  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

}


/*
 * ------------------------------------------------------------
 * STOP WORDS
 * ------------------------------------------------------------
 *
 * The customer's complete request should NOT be treated as
 * equally important.
 *
 * Common conversational words therefore receive no matching
 * weight.
 */

var occasionStopWords = {
  a: true,
  an: true,
  and: true,
  are: true,
  as: true,
  at: true,
  be: true,
  by: true,
  can: true,
  could: true,
  for: true,
  from: true,
  get: true,
  give: true,
  giving: true,
  good: true,
  have: true,
  i: true,
  idea: true,
  in: true,
  is: true,
  it: true,
  me: true,
  my: true,
  need: true,
  of: true,
  on: true,
  or: true,
  please: true,
  something: true,
  that: true,
  the: true,
  this: true,
  to: true,
  want: true,
  with: true,
  would: true,
  you: true,
  your: true,
  looking: true,
  lookingfor: true,
  jewellery: true,
  jewelry: true
};


/*
 * ------------------------------------------------------------
 * TOKENIZATION
 * ------------------------------------------------------------
 */

function tokenizeOccasionText(value) {

  var normalized = normalizeSearchText(value);

  if (!normalized) {
    return [];
  }

  var tokens = normalized.split(/\s+/);
  var result = [];

  for (var i = 0; i < tokens.length; i++) {

    var token = tokens[i]
      .replace(/^[-']+|[-']+$/g, "")
      .trim();

    if (!token) {
      continue;
    }

    if (token.length < 3) {
      continue;
    }

    if (occasionStopWords[token]) {
      continue;
    }

    if (result.indexOf(token) === -1) {
      result.push(token);
    }

  }

  return result;

}


/*
 * ------------------------------------------------------------
 * OCCASION SIGNALS
 * ------------------------------------------------------------
 *
 * These are semantic expansions, NOT catalogue data.
 *
 * They help the tool understand the customer's occasion.
 * They do NOT identify or hardcode Shopify collections.
 */

var occasionSignalGroups = {

  wedding: [
    "wedding",
    "bride",
    "groom",
    "bridal",
    "marriage",
    "matrimony",
    "weddingday",
    "bridesmaid",
    "groomsmen"
  ],

  anniversary: [
    "anniversary",
    "milestone",
    "years",
    "marriageanniversary",
    "relationshipanniversary"
  ],

  birthday: [
    "birthday",
    "birth",
    "celebration"
  ],

  graduation: [
    "graduation",
    "graduate",
    "graduating",
    "commencement"
  ],

  engagement: [
    "engagement",
    "engaged",
    "proposal",
    "proposing",
    "fiance",
    "fiancee"
  ],

  valentines: [
    "valentine",
    "valentines",
    "valentineday",
    "romantic",
    "romance",
    "love"
  ],

  christmas: [
    "christmas",
    "xmas",
    "festive",
    "holiday"
  ],

  mothers_day: [
    "mother",
    "mothers",
    "mothersday",
    "mom",
    "mum"
  ],

  fathers_day: [
    "father",
    "fathers",
    "fathersday",
    "dad"
  ],

  religious: [
    "religious",
    "faith",
    "christian",
    "christianity",
    "church",
    "bible",
    "biblical",
    "cross",
    "jesus",
    "christ",
    "muslim",
    "islam",
    "islamic",
    "jewish",
    "judaism",
    "hindu",
    "hinduism"
  ],

  music_artist_event: [
    "music",
    "musician",
    "artist",
    "concert",
    "tour",
    "festival",
    "album",
    "song",
    "singer",
    "band",
    "performance"
  ],

  special_event: [
    "event",
    "function",
    "gala",
    "ball",
    "party",
    "celebration",
    "ceremony",
    "formal",
    "specialevent"
  ],

  luxury: [
    "luxury",
    "luxurious",
    "premium",
    "prestige",
    "exclusive",
    "elegant",
    "statement"
  ],

  everyday: [
    "everyday",
    "daily",
    "casual",
    "regular",
    "dailywear"
  ]

};


/*
 * ------------------------------------------------------------
 * OCCASION SIGNAL EXPANSION
 * ------------------------------------------------------------
 */

function getOccasionSignals(input) {

  var occasionText = cleanOccasionValue(input.occasion);
  var detailsText = cleanOccasionValue(input.occasionDetails);
  var requestText = cleanOccasionValue(input.request);

  var combined =
    occasionText + " " +
    detailsText + " " +
    requestText;

  var normalized = normalizeSearchText(combined);
  var signals = [];

  var groups = Object.keys(occasionSignalGroups);

  for (var i = 0; i < groups.length; i++) {

    var groupName = groups[i];
    var terms = occasionSignalGroups[groupName];

    for (var j = 0; j < terms.length; j++) {

      var term = normalizeSearchText(terms[j]);

      if (!term) {
        continue;
      }

      /*
       * Handle both normal phrases and compact forms.
       */
      var searchableNormalized = normalized.replace(/\s+/g, "");

      var termMatched =
        normalized.indexOf(term) !== -1 ||
        searchableNormalized.indexOf(term) !== -1;

      if (termMatched) {

        if (signals.indexOf(term) === -1) {
          signals.push(term);
        }

      }

    }

  }

  /*
   * Also preserve meaningful explicit occasion/detail tokens.
   */
  var explicitTokens = tokenizeOccasionText(
    occasionText + " " + detailsText
  );

  for (var k = 0; k < explicitTokens.length; k++) {

    if (signals.indexOf(explicitTokens[k]) === -1) {
      signals.push(explicitTokens[k]);
    }

  }

  return signals;

}


/*
 * ------------------------------------------------------------
 * COLLECTION TEXT EXTRACTION
 * ------------------------------------------------------------
 *
 * Collection title/name is strongest.
 * Description is important for semantic validation.
 * Tags/type/handle provide supporting metadata.
 */

function getCollectionSearchText(collection) {

  if (!collection || typeof collection !== "object") {
    return {
      primary: "",
      secondary: "",
      all: ""
    };
  }

  var primaryParts = [
    collection.title,
    collection.name
  ];

  var secondaryParts = [
    collection.handle,
    collection.type,
    collection.tags,
    collection.description,
    collection.descriptionHtml
  ];

  return {
    primary: normalizeSearchText(primaryParts.join(" ")),
    secondary: normalizeSearchText(secondaryParts.join(" ")),
    all: normalizeSearchText(
      primaryParts.concat(secondaryParts).join(" ")
    )
  };

}


/*
 * ------------------------------------------------------------
 * PRODUCT TEXT EXTRACTION
 * ------------------------------------------------------------
 */

function getProductSearchText(product) {

  if (!product || typeof product !== "object") {
    return {
      primary: "",
      secondary: "",
      all: ""
    };
  }

  var primaryParts = [
    product.title,
    product.name
  ];

  var secondaryParts = [
    product.handle,
    product.productType,
    product.type,
    product.vendor,
    product.tags,
    product.description,
    product.descriptionHtml
  ];

  /*
   * Product collection metadata.
   */
  if (Array.isArray(product.collections)) {

    for (var i = 0; i < product.collections.length; i++) {

      var collection = product.collections[i];

      if (typeof collection === "string") {
        secondaryParts.push(collection);
      }

      else if (collection && typeof collection === "object") {
        secondaryParts.push(
          collection.title,
          collection.name,
          collection.handle,
          collection.description
        );
      }

    }

  }

  /*
   * Image metadata only.
   *
   * This does NOT claim pixel-level image understanding.
   */
  if (Array.isArray(product.images)) {

    for (var j = 0; j < product.images.length; j++) {

      var image = product.images[j];

      if (image && typeof image === "object") {

        secondaryParts.push(
          image.alt,
          image.altText,
          image.title
        );

      }

    }

  }

  return {
    primary: normalizeSearchText(primaryParts.join(" ")),
    secondary: normalizeSearchText(secondaryParts.join(" ")),
    all: normalizeSearchText(
      primaryParts.concat(secondaryParts).join(" ")
    )
  };

}


/*
 * ------------------------------------------------------------
 * TERM MATCHING
 * ------------------------------------------------------------
 */

function countTermMatches(text, terms) {

  if (!text || !terms || !terms.length) {
    return 0;
  }

  var count = 0;

  for (var i = 0; i < terms.length; i++) {

    var term = normalizeSearchText(terms[i]);

    if (!term) {
      continue;
    }

    var compactText = text.replace(/\s+/g, "");
    var compactTerm = term.replace(/\s+/g, "");

    if (
      text.indexOf(term) !== -1 ||
      compactText.indexOf(compactTerm) !== -1
    ) {
      count++;
    }

  }

  return count;

}


/*
 * ------------------------------------------------------------
 * COLLECTION SCORING
 * ------------------------------------------------------------
 *
 * Collection title/name:
 *     strongest signal
 *
 * Collection description:
 *     semantic refinement signal
 *
 * Handle/type/tags:
 *     supporting signal
 *
 * Generic customer request:
 *     intentionally weak
 */

function scoreCollection(collection, input, occasionSignals) {

  var text = getCollectionSearchText(collection);

  var occasionText = normalizeSearchText(
    cleanOccasionValue(input.occasion)
  );

  var detailsText = normalizeSearchText(
    cleanOccasionValue(input.occasionDetails)
  );

  var requestTokens = tokenizeOccasionText(input.request);

  var score = 0;
  var reasons = [];

  /*
   * ----------------------------------------------------------
   * 1. Occasion signals against collection title/name
   * ----------------------------------------------------------
   */

  var primaryOccasionMatches =
    countTermMatches(text.primary, occasionSignals);

  if (primaryOccasionMatches > 0) {

    score += primaryOccasionMatches * 40;

    reasons.push(
      "Collection title/name matches the occasion or occasion context."
    );

  }


  /*
   * ----------------------------------------------------------
   * 2. Explicit occasion against collection title/name
   * ----------------------------------------------------------
   */

  var explicitOccasionTokens =
    tokenizeOccasionText(occasionText);

  var explicitPrimaryMatches =
    countTermMatches(text.primary, explicitOccasionTokens);

  if (explicitPrimaryMatches > 0) {

    score += explicitPrimaryMatches * 30;

    reasons.push(
      "Collection title/name contains explicit occasion signals."
    );

  }


  /*
   * ----------------------------------------------------------
   * 3. Occasion signals against collection description
   * ----------------------------------------------------------
   *
   * This is the semantic refinement layer.
   */

  var descriptionOccasionMatches =
    countTermMatches(text.secondary, occasionSignals);

  if (descriptionOccasionMatches > 0) {

    score += descriptionOccasionMatches * 18;

    reasons.push(
      "Collection metadata or description supports the occasion match."
    );

  }


  /*
   * ----------------------------------------------------------
   * 4. Customer occasion details against collection metadata
   * ----------------------------------------------------------
   */

  var detailTokens =
    tokenizeOccasionText(detailsText);

  var detailMatches =
    countTermMatches(text.secondary, detailTokens);

  if (detailMatches > 0) {

    score += detailMatches * 10;

    reasons.push(
      "Collection metadata or description matches occasion details."
    );

  }


  /*
   * ----------------------------------------------------------
   * 5. Limited use of general request tokens
   * ----------------------------------------------------------
   *
   * The complete request is useful, but deliberately weak.
   */

  var requestMatches =
    countTermMatches(text.all, requestTokens);

  if (requestMatches > 0) {

    score += Math.min(requestMatches * 2, 12);

    reasons.push(
      "Collection has supporting language related to the customer's request."
    );

  }


  return {
    score: score,
    reasons: reasons
  };

}


/*
 * ------------------------------------------------------------
 * PRODUCT SCORING
 * ------------------------------------------------------------
 *
 * Products are refined after collection discovery.
 *
 * Collection membership is stronger than a generic product
 * description match.
 */

function scoreProduct(product, input, occasionSignals, relevantCollectionIds) {

  var text = getProductSearchText(product);

  var score = 0;
  var reasons = [];

  /*
   * ----------------------------------------------------------
   * 1. Product collection membership
   * ----------------------------------------------------------
   */

  var collectionMatch = false;

  if (
    relevantCollectionIds &&
    relevantCollectionIds.length &&
    Array.isArray(product.collections)
  ) {

    for (var i = 0; i < product.collections.length; i++) {

      var collection = product.collections[i];

      var collectionId = "";
      var collectionTitle = "";

      if (typeof collection === "string") {
        collectionId = collection;
        collectionTitle = collection;
      }

      else if (collection && typeof collection === "object") {

        collectionId =
          collection.id ||
          collection.collectionId ||
          collection.handle ||
          "";

        collectionTitle =
          collection.title ||
          collection.name ||
          collection.handle ||
          "";

      }

      for (var j = 0; j < relevantCollectionIds.length; j++) {

        var relevantId = String(
          relevantCollectionIds[j]
        ).toLowerCase();

        if (
          String(collectionId).toLowerCase() === relevantId ||
          normalizeSearchText(collectionTitle).indexOf(
            normalizeSearchText(relevantId)
          ) !== -1
        ) {

          collectionMatch = true;
          break;

        }

      }

      if (collectionMatch) {
        break;
      }

    }

  }


  if (collectionMatch) {

    score += 35;

    reasons.push(
      "Product belongs to a collection identified as relevant to the occasion."
    );

  }


  /*
   * ----------------------------------------------------------
   * 2. Product title/name
   * ----------------------------------------------------------
   */

  var primaryMatches =
    countTermMatches(text.primary, occasionSignals);

  if (primaryMatches > 0) {

    score += primaryMatches * 20;

    reasons.push(
      "Product title/name supports the occasion."
    );

  }


  /*
   * ----------------------------------------------------------
   * 3. Product description and metadata
   * ----------------------------------------------------------
   *
   * Secondary refinement.
   */

  var secondaryMatches =
    countTermMatches(text.secondary, occasionSignals);

  if (secondaryMatches > 0) {

    score += secondaryMatches * 8;

    reasons.push(
      "Product description or metadata supports the occasion."
    );

  }


  /*
   * ----------------------------------------------------------
   * 4. Occasion details
   * ----------------------------------------------------------
   */

  var detailTokens =
    tokenizeOccasionText(input.occasionDetails);

  var detailMatches =
    countTermMatches(text.secondary, detailTokens);

  if (detailMatches > 0) {

    score += Math.min(detailMatches * 5, 15);

    reasons.push(
      "Product metadata contains language related to the occasion details."
    );

  }


  return {
    score: score,
    reasons: reasons
  };

}


/*
 * ------------------------------------------------------------
 * SAFE ARRAY EXTRACTION
 * ------------------------------------------------------------
 */

function extractDataArray(response) {

  if (!response) {
    return [];
  }

  /*
   * Bit 1B invoke() returns:
   * { status:"ok", data: ... }
   */

  var data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  if (data && Array.isArray(data.collections)) {
    return data.collections;
  }

  if (data && Array.isArray(data.products)) {
    return data.products;
  }

  return [];

}


/*
 * ------------------------------------------------------------
 * IDENTIFIERS
 * ------------------------------------------------------------
 */

function getItemIdentifier(item) {

  if (!item || typeof item !== "object") {
    return "";
  }

  return String(
    item.id ||
    item.collectionId ||
    item.productId ||
    item.handle ||
    item.title ||
    item.name ||
    ""
  );

}


/*
 * ------------------------------------------------------------
 * OCCASION CATALOGUE DISCOVERY
 * ------------------------------------------------------------
 */

async function discoverOccasionCatalogue(input) {

  /*
   * Catalogue discovery can be disabled by the caller.
   */
  if (input.catalogueDiscovery === false) {

    return {
      performed: false,
      status: "not_requested",
      searchTerms: [],
      relevantCollections: [],
      relevantProducts: [],
      reason:
        "Catalogue discovery was not requested."
    };

  }


  /*
   * Ensure Bit 1B exists.
   */
  if (
    !window.GodreryToneWebMCP ||
    !window.GodreryToneWebMCP.data ||
    typeof window.GodreryToneWebMCP.data.invoke !== "function"
  ) {

    return {
      performed: false,
      status: "unknown",
      searchTerms: getOccasionSignals(input),
      relevantCollections: [],
      relevantProducts: [],
      reason:
        "The current catalogue data adapter is not available."
    };

  }


  var GT = window.GodreryToneWebMCP;

  var occasionSignals =
    getOccasionSignals(input);


  /*
   * ----------------------------------------------------------
   * CURRENT COLLECTIONS
   * ----------------------------------------------------------
   */

  var collectionsResponse;

  try {

    collectionsResponse =
      await GT.data.invoke(
        "getCollections",
        {
          includeDescriptions: true,
          includeTags: true
        }
      );

  }

  catch (collectionError) {

    collectionsResponse = {
      status: "unknown",
      data: null,
      error: String(collectionError)
    };

  }


  var collections =
    extractDataArray(collectionsResponse);


  /*
   * ----------------------------------------------------------
   * CURRENT PRODUCTS
   * ----------------------------------------------------------
   */

  var productsResponse;

  try {

    productsResponse =
      await GT.data.getProducts({
        includeCollections: true,
        includeDescriptions: true,
        includeTags: true,
        includeImages: true
      });

  }

  catch (productError) {

    productsResponse = {
      status: "unknown",
      data: null,
      error: String(productError)
    };

  }


  var products =
    extractDataArray(productsResponse);


  /*
   * ----------------------------------------------------------
   * COLLECTION MATCHING
   * ----------------------------------------------------------
   */

  var scoredCollections = [];

  for (var i = 0; i < collections.length; i++) {

    var collection = collections[i];

    var collectionScore =
      scoreCollection(
        collection,
        input,
        occasionSignals
      );

    if (collectionScore.score <= 0) {
      continue;
    }

    scoredCollections.push({
      item: collection,
      score: collectionScore.score,
      reasons: collectionScore.reasons
    });

  }


  scoredCollections.sort(function(a, b) {
    return b.score - a.score;
  });


  /*
   * Keep the strongest collection candidates.
   *
   * This is a discovery result, not a final product decision.
   */

  var selectedCollections =
    scoredCollections.slice(0, 10);


  var relevantCollectionIds = [];

  for (var j = 0; j < selectedCollections.length; j++) {

    var collectionId =
      getItemIdentifier(
        selectedCollections[j].item
      );

    if (collectionId) {
      relevantCollectionIds.push(collectionId);
    }

  }


  /*
   * ----------------------------------------------------------
   * PRODUCT REFINEMENT
   * ----------------------------------------------------------
   */

  var scoredProducts = [];

  for (var k = 0; k < products.length; k++) {

    var product = products[k];

    var productScore =
      scoreProduct(
        product,
        input,
        occasionSignals,
        relevantCollectionIds
      );

    if (productScore.score <= 0) {
      continue;
    }

    scoredProducts.push({
      item: product,
      score: productScore.score,
      reasons: productScore.reasons
    });

  }


  scoredProducts.sort(function(a, b) {
    return b.score - a.score;
  });


  /*
   * Return a manageable discovery set.
   *
   * Later catalogue/recommendation tools can perform further
   * filtering.
   */

  var selectedProducts =
    scoredProducts.slice(0, 20);


  /*
   * ----------------------------------------------------------
   * SOURCE AVAILABILITY
   * ----------------------------------------------------------
   */

  var collectionsAvailable =
    collectionsResponse &&
    collectionsResponse.status === "ok";

  var productsAvailable =
    productsResponse &&
    productsResponse.status === "ok";


  /*
   * Neither catalogue source is available.
   */

  if (
    !collectionsAvailable &&
    !productsAvailable
  ) {

    return {
      performed: true,
      status: "unknown",
      searchTerms: occasionSignals,
      relevantCollections: [],
      relevantProducts: [],
      reason:
        "Current catalogue data could not be established."
    };

  }


  /*
   * ----------------------------------------------------------
   * RESULT FORMATTING
   * ----------------------------------------------------------
   */

  var formattedCollections = [];

  for (var c = 0; c < selectedCollections.length; c++) {

    var selectedCollection =
      selectedCollections[c];

    var collectionItem =
      selectedCollection.item;

    formattedCollections.push({

      id:
        collectionItem.id ||
        collectionItem.collectionId ||
        null,

      title:
        collectionItem.title ||
        collectionItem.name ||
        null,

      handle:
        collectionItem.handle ||
        null,

      score:
        selectedCollection.score,

      reasons:
        selectedCollection.reasons

    });

  }


  var formattedProducts = [];

  for (var p = 0; p < selectedProducts.length; p++) {

    var selectedProduct =
      selectedProducts[p];

    var productItem =
      selectedProduct.item;

    formattedProducts.push({

      id:
        productItem.id ||
        productItem.productId ||
        null,

      title:
        productItem.title ||
        productItem.name ||
        null,

      handle:
        productItem.handle ||
        null,

      vendor:
        productItem.vendor ||
        null,

      score:
        selectedProduct.score,

      reasons:
        selectedProduct.reasons

    });

  }


  /*
   * ----------------------------------------------------------
   * DISCOVERY STATUS
   * ----------------------------------------------------------
   */

  var discoveryStatus =
    (
      formattedCollections.length ||
      formattedProducts.length
    )
      ? "matched"
      : "no_match";


  return {

    performed: true,

    status: discoveryStatus,

    searchTerms: occasionSignals,

    relevantCollections:
      formattedCollections,

    relevantProducts:
      formattedProducts,

    reason:
      discoveryStatus === "matched"
        ? "Current catalogue collections were evaluated first, with collection descriptions and product metadata used to refine the occasion match."
        : "The current catalogue was inspected, but no sufficiently relevant collection or product candidate was identified."

  };

}


/*
 * ------------------------------------------------------------
 * PUBLIC OCCASION RESULT
 * ------------------------------------------------------------
 */

async function createOccasionResult(input) {

  input = input || {};

  var request =
    cleanOccasionValue(input.request);

  var occasion =
    cleanOccasionValue(input.occasion);

  var occasionDetails =
    cleanOccasionValue(input.occasionDetails);

  var occasionCertainty =
    normalizeOccasionCertainty(
      input.occasionCertainty
    );


  var catalogueDiscovery;

  try {

    catalogueDiscovery =
      await discoverOccasionCatalogue({
        request: request,
        occasion: occasion,
        occasionDetails: occasionDetails,
        occasionCertainty: occasionCertainty,
        catalogueDiscovery:
          input.catalogueDiscovery !== false
      });

  }

  catch (error) {

    catalogueDiscovery = {

      performed: true,

      status: "unknown",

      searchTerms:
        getOccasionSignals({
          request: request,
          occasion: occasion,
          occasionDetails: occasionDetails
        }),

      relevantCollections: [],

      relevantProducts: [],

      reason:
        "Catalogue discovery could not be completed."
    };

  }


  return {

    success: true,

    brand: "GodreryTone",

    occasionIntent: {

      request: request,

      occasion: occasion,

      occasionDetails: occasionDetails,

      occasionCertainty: occasionCertainty

    },

    catalogueDiscovery:
      catalogueDiscovery,

    guidance: [

      "Use the customer's explicitly stated occasion when available.",

      "If the occasion is inferred, treat it as an inference rather than a fact.",

      "Use current Shopify collections as the primary catalogue-discovery signal.",

      "Use collection descriptions and metadata to refine and validate the collection match.",

      "Use product collection membership, product titles, metadata and descriptions as secondary refinement signals.",

      "Image URLs and image metadata may be considered when available, but do not claim pixel-level image understanding unless a vision-capable service is actually connected.",

      "Do not invent products, collections, catalogue attributes or customer preferences.",

      "Catalogue relevance does not establish destination eligibility.",

      "Do not determine shipping eligibility, shipping cost, market eligibility or final purchase readiness in this tool.",

      "Do not change the customer's shopping market.",

      "Pass relevant catalogue candidates to the later recommendation and catalogue workflow for further filtering."
    ],

    nextStep:
      "Pass structured occasion intent and catalogue-discovery candidates to the recommendation and catalogue-search workflow."

  };

}


/*
 * ============================================================
 * REGISTER TOOL
 * ============================================================
 */

try {

  if (
    typeof document !== "undefined" &&
    document.modelContext &&
    typeof document.modelContext.registerTool === "function"
  ) {

    document.modelContext.registerTool({

      name:
        "godrerytone_occasion",

      description:
        "Understand a customer's jewellery occasion and use that occasion as a dynamic catalogue-discovery signal. The tool first evaluates current Shopify collections, including collection descriptions and metadata, then uses relevant collection membership and product metadata/descriptions to refine product candidates. It does not hardcode current catalogue data, change the customer's market, determine destination eligibility, determine shipping, determine final pricing, or make the purchase decision.",

      inputSchema:
        occasionSchema,

      execute:
        async function(input) {

          return JSON.stringify(
            await createOccasionResult(input)
          );

        }

    });

    console.info(
      "[GodreryTone WebMCP] Tool 2 occasion registered."
    );

  }

  else {

    console.info(
      "[GodreryTone WebMCP] WebMCP modelContext is not available for Tool 2."
    );

  }

}

catch (error) {

  console.error(
    "[GodreryTone WebMCP] Tool 2 registration failed:",
    error
  );

}
/* =========================================================
   GODRERYTONE AGE TOOL
   ========================================================= */

    var ageToolName = "godrerytone_age";

    var ageSchema = {
      type: "object",

      properties: {
        recipient: {
          type: "string",
          description:
            "The person the jewellery is intended for, when provided."
        },

        recipientAge: {
          type: "number",
          description:
            "The recipient's exact age when explicitly provided. Never invent an age."
        },

        recipientAgeRange: {
          type: "string",
          description:
            "The recipient's approximate age range when provided."
        },

        ageRelevant: {
          type: "boolean",
          description:
            "Whether recipient age is relevant to the jewellery recommendation."
        },

        request: {
          type: "string",
          description:
            "The customer's natural-language request containing any age-related information."
        }
      },

      required: [
        "request"
      ]
    };

    function createAgeResult(input) {

      var exactAgeProvided =
      input.recipientAge !== undefined &&
      input.recipientAge !== null &&
      input.recipientAge !== "";

      var ageRangeProvided =
      input.recipientAgeRange !== undefined &&
      input.recipientAgeRange !== null &&
      input.recipientAgeRange !== "";

      var ageWasProvided =
      exactAgeProvided || ageRangeProvided;

      return {
        success: true,

        brand: "GodreryTone",

        ageIntent: {

          request: input.request || null,

          recipient:
            input.recipient !== undefined &&
          input.recipient !== null &&
          input.recipient !== ""
          ? input.recipient
          : null,

          recipientAge:
            exactAgeProvided
          ? input.recipientAge
          : null,

          recipientAgeRange:
            ageRangeProvided
          ? input.recipientAgeRange
          : null,

          ageProvided: ageWasProvided,

          ageRelevant:
            input.ageRelevant === true ||
          ageWasProvided
        },

        agentGuidance: [

          "Use recipient age only when the customer provides it.",

          "Never invent, estimate, or assume an exact recipient age.",

          "If the customer provides an age range, preserve the age range rather than converting it into an exact age.",

          "Age should only influence recommendations when it is relevant to the customer's jewellery request.",

          "Do not reject a jewellery request simply because recipient age was not provided.",

          "Do not assume that a particular jewellery style belongs to a particular age group.",

          "Treat age as one recommendation signal alongside recipient, occasion, style, jewellery category, budget, and customer preferences.",

          "The customer's explicitly stated style or preference should not be overridden merely because of age.",

          "If age is not relevant, leave age information empty rather than forcing an age-based recommendation.",

          "Do not make sensitive assumptions about the recipient based on age.",

          "When age is relevant, use it to refine product discovery rather than making the purchase decision for the customer.",

          "If the customer gives no age information, continue normally using the other available shopping preferences."
        ],

        nextStep:
          "Combine applicable age information with recipient, occasion, style, category, budget, and market information when searching the GodreryTone catalogue."
      };
    }

    try {

      document.modelContext.registerTool({

          name: ageToolName,

          description:
            "Process recipient age information when applicable to a GodreryTone jewellery request. Respect exact ages and age ranges provided by the customer, never invent missing ages, and use age only as a relevant recommendation signal.",

          inputSchema: ageSchema,

          execute: async function (input) {

            return JSON.stringify(
              createAgeResult(input)
            );

          }

      });

      console.info(
        "[GodreryTone WebMCP] age tool registered successfully."
      );

    } catch (error) {

      console.error(
        "[GodreryTone WebMCP] Age tool registration failed:",
        error
      );

    }
    /*
 * ============================================================
 * TOOL 3 — STYLE
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 * Understand jewellery style in natural customer language.
 *
 * This tool performs FOUR functions:
 *
 * 1. STYLE UNDERSTANDING
 *    Identify the style the customer wants.
 *
 * 2. STYLE EDUCATION
 *    Explain jewellery-style terminology when the customer
 *    asks what a style means or asks for a comparison.
 *
 * 3. STYLE NORMALIZATION
 *    Translate natural customer language into a meaningful,
 *    standardized jewellery-style term.
 *
 * 4. CATALOGUE DISCOVERY
 *    Use the normalized style to inspect the CURRENT Shopify
 *    catalogue, with collections as the primary discovery
 *    signal and descriptions/product metadata as refinement.
 *
 * IMPORTANT
 * ------------------------------------------------------------
 * - Do NOT hardcode current Shopify products.
 * - Do NOT hardcode current Shopify collections.
 * - Do NOT hardcode current vendors, markets or countries.
 * - Style terminology below is semantic knowledge, not
 *   catalogue data.
 * - Do NOT determine destination eligibility.
 * - Do NOT determine shipping.
 * - Do NOT determine final pricing.
 * - Do NOT make the purchase decision.
 * - Do NOT claim pixel-level image understanding.
 *
 * Tool 1 Bit 1 + Bit 1B remains the foundation.
 * Tool 2 Occasion remains separate.
 * ============================================================
 */


/*
 * ============================================================
 * STYLE SCHEMA
 * ============================================================
 */

var styleSchema = {

  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request or jewellery-style question."
    },

    style: {
      type: "string",
      description:
        "The primary standardized jewellery style when one can be established, such as minimalist, delicate, understated, classic, timeless, elegant, sophisticated, modern, contemporary, vintage, retro, romantic, glamorous, luxury, statement, bold, dramatic, edgy, bohemian, artistic, artisanal, ornate, intricate, casual, everyday, formal, geometric, organic, nature-inspired, symbolic, faith-inspired, personalized, playful, regal, bridal, or avant-garde."
    },

    styleDetails: {
      type: "string",
      description:
        "Additional style characteristics expressed by the customer, such as simple, clean, subtle, flashy, eye-catching, intricate, glamorous, understated, sophisticated, contemporary, timeless, traditional, or bold."
    },

    styleCertainty: {
      type: "string",
      enum: [
        "explicit",
        "inferred",
        "unknown"
      ],
      description:
        "Whether the normalized style was explicitly stated, reasonably inferred from the customer's language, or cannot be established."
    },

    styleQuestion: {
      type: "boolean",
      description:
        "True when the customer is asking for an explanation, definition, comparison, or clarification of jewellery-style terminology rather than directly requesting a product."
    },

    styleTerm: {
      type: "string",
      description:
        "The jewellery-style term the customer is asking about, when a terminology question is present."
    },

    explainStyle: {
      type: "boolean",
      description:
        "Whether the customer is asking for the meaning or explanation of a jewellery-style term."
    },

    catalogueDiscovery: {
      type: "boolean",
      description:
        "Whether the tool should inspect the current Shopify catalogue for collections and products relevant to the normalized style. Defaults to true."
    }

  },

  required: [
    "request"
  ]

};


/*
 * ============================================================
 * JEWELLERY STYLE VOCABULARY
 * ============================================================
 *
 * This is semantic knowledge.
 *
 * It does NOT represent current GodreryTone catalogue data.
 *
 * Each style contains:
 *
 * - definition
 * - aliases
 * - language customers may use
 * - related styles
 *
 * The vocabulary allows the tool to translate ordinary
 * customer language into standardized jewellery terminology.
 * ============================================================
 */

var jewelleryStyleVocabulary = {

  minimalist: {
    definition:
      "A simple, clean jewellery aesthetic with restrained shapes, limited detailing, and an uncluttered appearance.",

    aliases: [
      "minimalist",
      "minimal",
      "simple",
      "clean",
      "uncluttered",
      "less is more",
      "simple jewellery"
    ],

    related: [
      "understated",
      "delicate",
      "modern"
    ]
  },


  delicate: {
    definition:
      "Jewellery with a fine, light, subtle, or visually gentle appearance, often using slim forms or small details.",

    aliases: [
      "delicate",
      "dainty",
      "fine",
      "tiny",
      "small",
      "light",
      "subtle",
      "dainty jewellery"
    ],

    related: [
      "minimalist",
      "understated",
      "feminine"
    ]
  },


  understated: {
    definition:
      "A restrained style that looks polished and attractive without being flashy, loud, or attention-seeking.",

    aliases: [
      "understated",
      "not flashy",
      "not too flashy",
      "subtle",
      "quiet",
      "low key",
      "low-key",
      "discreet",
      "not loud"
    ],

    related: [
      "minimalist",
      "delicate",
      "classic"
    ]
  },


  classic: {
    definition:
      "A familiar, refined jewellery aesthetic based on designs that remain stylish and recognizable over time.",

    aliases: [
      "classic",
      "traditional classic",
      "traditional",
      "refined",
      "polished",
      "conventional"
    ],

    related: [
      "timeless",
      "elegant",
      "sophisticated"
    ]
  },


  timeless: {
    definition:
      "A style intended to remain attractive and relevant over many years rather than following a short-lived trend.",

    aliases: [
      "timeless",
      "will never go out of style",
      "never goes out of style",
      "forever style",
      "lasting",
      "enduring"
    ],

    related: [
      "classic",
      "elegant",
      "sophisticated"
    ]
  },


  elegant: {
    definition:
      "A graceful, tasteful, polished jewellery aesthetic that communicates refinement without necessarily being extravagant.",

    aliases: [
      "elegant",
      "graceful",
      "tasteful",
      "classy",
      "beautifully refined",
      "chic"
    ],

    related: [
      "sophisticated",
      "classic",
      "timeless",
      "luxury"
    ]
  },


  sophisticated: {
    definition:
      "A polished and refined style with a mature, considered, and carefully coordinated appearance.",

    aliases: [
      "sophisticated",
      "refined",
      "polished",
      "cultured",
      "mature",
      "high-end looking"
    ],

    related: [
      "elegant",
      "classic",
      "luxury"
    ]
  },


  modern: {
    definition:
      "A jewellery aesthetic that feels current, clean, fresh, and suited to contemporary tastes.",

    aliases: [
      "modern",
      "fresh",
      "current",
      "new",
      "modern looking"
    ],

    related: [
      "contemporary",
      "minimalist",
      "geometric"
    ]
  },


  contemporary: {
    definition:
      "A current jewellery style that reflects present-day design ideas, forms, proportions, or aesthetics.",

    aliases: [
      "contemporary",
      "current design",
      "present day",
      "up to date",
      "current style"
    ],

    related: [
      "modern",
      "minimalist",
      "avant-garde"
    ]
  },


  vintage: {
    definition:
      "A jewellery style inspired by designs, aesthetics, or craftsmanship associated with an earlier period.",

    aliases: [
      "vintage",
      "old fashioned",
      "old-fashioned",
      "from another era",
      "period style",
      "retro inspired"
    ],

    related: [
      "retro",
      "antique-inspired",
      "classic"
    ]
  },


  retro: {
    definition:
      "A style that deliberately revives or references the visual character of a particular past era.",

    aliases: [
      "retro",
      "throwback",
      "old school",
      "old-school",
      "nostalgic"
    ],

    related: [
      "vintage",
      "classic"
    ]
  },


  antique_inspired: {
    definition:
      "Jewellery designed with visual references to antique or historical jewellery, even when the actual piece is newly made.",

    aliases: [
      "antique",
      "antique inspired",
      "antique-inspired",
      "historical",
      "heritage"
    ],

    related: [
      "vintage",
      "traditional",
      "ornate"
    ]
  },


  romantic: {
    definition:
      "A soft, sentimental, affectionate, or love-inspired jewellery aesthetic.",

    aliases: [
      "romantic",
      "romance",
      "love inspired",
      "love-inspired",
      "sweet",
      "sentimental",
      "loving"
    ],

    related: [
      "delicate",
      "feminine",
      "elegant"
    ]
  },


  glamorous: {
    definition:
      "A visually luxurious, polished, sparkling, dramatic, or attention-attracting jewellery aesthetic.",

    aliases: [
      "glamorous",
      "glam",
      "glamour",
      "sparkly",
      "red carpet",
      "show stopping",
      "show-stopping"
    ],

    related: [
      "luxury",
      "statement",
      "dramatic"
    ]
  },


  luxury: {
    definition:
      "A premium, opulent, prestigious, or highly refined jewellery aesthetic associated with exceptional visual or perceived quality.",

    aliases: [
      "luxury",
      "luxurious",
      "premium",
      "prestige",
      "exclusive",
      "high end",
      "high-end",
      "opulent"
    ],

    related: [
      "glamorous",
      "sophisticated",
      "regal"
    ]
  },


  statement: {
    definition:
      "Jewellery designed to be visually noticeable and communicate a strong aesthetic presence.",

    aliases: [
      "statement",
      "statement piece",
      "statement jewellery",
      "eye catching",
      "eye-catching",
      "attention grabbing",
      "attention-grabbing",
      "stands out"
    ],

    related: [
      "bold",
      "dramatic",
      "glamorous"
    ]
  },


  bold: {
    definition:
      "A strong, confident jewellery aesthetic using noticeable forms, proportions, details, or visual impact.",

    aliases: [
      "bold",
      "strong",
      "powerful",
      "confident",
      "big",
      "striking"
    ],

    related: [
      "statement",
      "dramatic",
      "edgy"
    ]
  },


  dramatic: {
    definition:
      "A high-impact style designed to create strong visual contrast, presence, or theatrical effect.",

    aliases: [
      "dramatic",
      "theatrical",
      "high impact",
      "high-impact",
      "dramatic look"
    ],

    related: [
      "statement",
      "bold",
      "glamorous"
    ]
  },


  edgy: {
    definition:
      "A distinctive, unconventional, rebellious, or fashion-forward jewellery aesthetic that avoids conventional styling.",

    aliases: [
      "edgy",
      "rebellious",
      "alternative",
      "rock",
      "punk",
      "unconventional",
      "cool"
    ],

    related: [
      "bold",
      "modern",
      "avant-garde"
    ]
  },


  bohemian: {
    definition:
      "A relaxed, expressive style often associated with artistic, natural, layered, eclectic, or free-spirited aesthetics.",

    aliases: [
      "bohemian",
      "boho",
      "free spirited",
      "free-spirited",
      "earthy",
      "eclectic"
    ],

    related: [
      "artistic",
      "nature inspired",
      "organic"
    ]
  },


  artistic: {
    definition:
      "A creative jewellery aesthetic emphasizing unusual forms, artistic expression, originality, or visual experimentation.",

    aliases: [
      "artistic",
      "creative",
      "artsy",
      "expressive",
      "original",
      "creative design"
    ],

    related: [
      "avant-garde",
      "bohemian",
      "statement"
    ]
  },


  artisanal: {
    definition:
      "A style emphasizing handcrafted character, craftsmanship, individuality, and the appearance of skilled making.",

    aliases: [
      "artisanal",
      "artisan",
      "handcrafted",
      "hand made",
      "handmade",
      "craft",
      "craftsmanship"
    ],

    related: [
      "artistic",
      "traditional",
      "organic"
    ]
  },


  ornate: {
    definition:
      "A richly decorated jewellery style with abundant ornamental detail and visual complexity.",

    aliases: [
      "ornate",
      "decorative",
      "elaborate",
      "richly detailed",
      "highly decorated"
    ],

    related: [
      "intricate",
      "regal",
      "vintage"
    ]
  },


  intricate: {
    definition:
      "A detailed jewellery style involving fine, complex, or carefully worked patterns and elements.",

    aliases: [
      "intricate",
      "detailed",
      "complex",
      "fine detail",
      "lots of detail",
      "detailed design"
    ],

    related: [
      "ornate",
      "artisanal",
      "vintage"
    ]
  },


  casual: {
    definition:
      "An easygoing jewellery style suited to relaxed clothing, informal settings, and everyday situations.",

    aliases: [
      "casual",
      "relaxed",
      "laid back",
      "laid-back",
      "informal"
    ],

    related: [
      "everyday",
      "minimalist"
    ]
  },


  everyday: {
    definition:
      "Jewellery designed or styled for regular wear across ordinary daily activities and settings.",

    aliases: [
      "everyday",
      "daily",
      "daily wear",
      "dailywear",
      "wear every day",
      "regular wear"
    ],

    related: [
      "casual",
      "minimalist",
      "delicate"
    ]
  },


  formal: {
    definition:
      "A polished jewellery aesthetic intended to complement formal occasions, refined clothing, ceremonies, or sophisticated settings.",

    aliases: [
      "formal",
      "dressy",
      "evening",
      "special occasion look",
      "black tie"
    ],

    related: [
      "elegant",
      "glamorous",
      "sophisticated"
    ]
  },


  geometric: {
    definition:
      "A jewellery style emphasizing structured shapes such as circles, squares, triangles, lines, angles, and other defined geometric forms.",

    aliases: [
      "geometric",
      "angular",
      "structured",
      "architectural",
      "clean shapes"
    ],

    related: [
      "modern",
      "contemporary",
      "minimalist"
    ]
  },


  organic: {
    definition:
      "A jewellery aesthetic based on flowing, irregular, natural, or softly shaped forms rather than rigid geometric structures.",

    aliases: [
      "organic",
      "flowing",
      "natural forms",
      "free form",
      "free-form",
      "soft shapes"
    ],

    related: [
      "nature inspired",
      "bohemian",
      "artisanal"
    ]
  },


  nature_inspired: {
    definition:
      "Jewellery whose visual language is inspired by nature, including plants, flowers, leaves, animals, landscapes, or natural forms.",

    aliases: [
      "nature inspired",
      "nature-inspired",
      "floral",
      "botanical",
      "leaf inspired",
      "flower inspired",
      "animal inspired"
    ],

    related: [
      "organic",
      "bohemian",
      "artistic"
    ]
  },


  symbolic: {
    definition:
      "Jewellery whose design carries a recognizable symbolic, emotional, cultural, personal, or representational meaning.",

    aliases: [
      "symbolic",
      "meaningful",
      "meaning",
      "symbol",
      "representative",
      "significant"
    ],

    related: [
      "personalized",
      "sentimental",
      "faith inspired"
    ]
  },


  faith_inspired: {
    definition:
      "Jewellery whose design expresses or references a religious or spiritual faith, belief, symbol, or tradition.",

    aliases: [
      "faith inspired",
      "faith-inspired",
      "religious",
      "spiritual",
      "christian",
      "christian inspired",
      "cross inspired",
      "biblical"
    ],

    related: [
      "symbolic",
      "traditional",
      "sentimental"
    ]
  },


  personalized: {
    definition:
      "Jewellery designed or selected around an individual's identity, name, initials, message, meaningful date, or personal symbolism.",

    aliases: [
      "personalized",
      "personalised",
      "custom",
      "customized",
      "customised",
      "personal",
      "made for me",
      "meaningful to me"
    ],

    related: [
      "symbolic",
      "sentimental"
    ]
  },


  sentimental: {
    definition:
      "Jewellery chosen primarily for emotional, commemorative, relational, or personal meaning.",

    aliases: [
      "sentimental",
      "meaningful",
      "emotional",
      "keepsake",
      "memorable",
      "special meaning"
    ],

    related: [
      "romantic",
      "symbolic",
      "personalized"
    ]
  },


  playful: {
    definition:
      "A fun, expressive jewellery style using whimsical, cheerful, colorful, unusual, or lighthearted design elements.",

    aliases: [
      "playful",
      "fun",
      "whimsical",
      "cheerful",
      "quirky",
      "cute"
    ],

    related: [
      "artistic",
      "youthful",
      "bohemian"
    ]
  },


  youthful: {
    definition:
      "A fresh, energetic, playful, or contemporary jewellery aesthetic with a youthful visual character.",

    aliases: [
      "youthful",
      "young",
      "fresh",
      "fun",
      "trendy"
    ],

    related: [
      "playful",
      "modern",
      "casual"
    ]
  },


  regal: {
    definition:
      "A grand, majestic, luxurious, or aristocratic jewellery aesthetic with an elevated and commanding appearance.",

    aliases: [
      "regal",
      "royal",
      "majestic",
      "aristocratic",
      "queenly",
      "princess like",
      "princess-like"
    ],

    related: [
      "luxury",
      "ornate",
      "glamorous"
    ]
  },


  bridal: {
    definition:
      "A jewellery style specifically suited to bridal wear, weddings, ceremonies, or a bride's wedding-day aesthetic.",

    aliases: [
      "bridal",
      "bride",
      "bride's jewellery",
      "wedding jewellery",
      "wedding day jewellery"
    ],

    related: [
      "formal",
      "elegant",
      "romantic"
    ]
  },


  avant_garde: {
    definition:
      "An experimental, unconventional, highly creative jewellery style that intentionally pushes beyond familiar design conventions.",

    aliases: [
      "avant garde",
      "avant-garde",
      "experimental",
      "fashion forward",
      "fashion-forward",
      "innovative",
      "unconventional design"
    ],

    related: [
      "artistic",
      "edgy",
      "contemporary"
    ]
  }

};


/*
 * ============================================================
 * NORMALIZATION HELPERS
 * ============================================================
 */

function cleanStyleValue(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim();

}


function normalizeStyleText(value) {

  return cleanStyleValue(value)
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

}


function normalizeStyleCertainty(value) {

  var certainty =
    normalizeStyleText(value);

  if (
    certainty === "explicit" ||
    certainty === "inferred" ||
    certainty === "unknown"
  ) {
    return certainty;
  }

  return "unknown";

}


/*
 * ============================================================
 * STYLE TERM MATCHING
 * ============================================================
 */

function findStyleMatches(text) {

  var normalized =
    normalizeStyleText(text);

  var compact =
    normalized.replace(/\s+/g, "");

  var matches = [];

  var styleNames =
    Object.keys(
      jewelleryStyleVocabulary
    );

  for (
    var i = 0;
    i < styleNames.length;
    i++
  ) {

    var styleName =
      styleNames[i];

    var entry =
      jewelleryStyleVocabulary[
        styleName
      ];

    var aliases =
      entry.aliases || [];

    var matchedAlias = "";

    for (
      var j = 0;
      j < aliases.length;
      j++
    ) {

      var alias =
        normalizeStyleText(
          aliases[j]
        );

      if (!alias) {
        continue;
      }

      var compactAlias =
        alias.replace(/\s+/g, "");

      if (
        normalized.indexOf(alias) !== -1 ||
        compact.indexOf(compactAlias) !== -1
      ) {

        matchedAlias =
          aliases[j];

        break;

      }

    }

    /*
     * Also recognize the canonical style name itself.
     */
    if (!matchedAlias) {

      var canonical =
        normalizeStyleText(
          styleName.replace(/_/g, " ")
        );

      var compactCanonical =
        canonical.replace(/\s+/g, "");

      if (
        normalized.indexOf(canonical) !== -1 ||
        compact.indexOf(compactCanonical) !== -1
      ) {

        matchedAlias =
          styleName.replace(/_/g, " ");

      }

    }

    if (matchedAlias) {

      matches.push({

        style:
          styleName,

        matchedLanguage:
          matchedAlias,

        definition:
          entry.definition,

        related:
          entry.related || []

      });

    }

  }

  return matches;

}


/*
 * ============================================================
 * STYLE QUESTION DETECTION
 * ============================================================
 */

function detectStyleQuestion(input) {

  var request =
    normalizeStyleText(
      input.request
    );

  var questionPatterns = [

    "what does",
    "what is",
    "what are",
    "what do you mean by",
    "what is meant by",
    "meaning of",
    "define",
    "definition of",
    "explain",
    "difference between",
    "whats the difference",
    "what's the difference",
    "compare",
    "means"
  ];

  for (
    var i = 0;
    i < questionPatterns.length;
    i++
  ) {

    if (
      request.indexOf(
        questionPatterns[i]
      ) !== -1
    ) {

      return true;

    }

  }

  return false;

}


/*
 * ============================================================
 * STYLE EXPLANATION
 * ============================================================
 */

function explainRequestedStyle(input) {

  var request =
    normalizeStyleText(
      input.request
    );

  var requestedTerm =
    normalizeStyleText(
      input.styleTerm
    );

  var matches =
    findStyleMatches(
      requestedTerm || request
    );

  if (!matches.length) {

    return {

      available: false,

      term:
        cleanStyleValue(
          input.styleTerm
        ) || null,

      explanation:
        null,

      relatedStyles: []

    };

  }

  /*
   * Use the strongest first recognized style.
   */

  var match =
    matches[0];

  return {

    available: true,

    term:
      match.style.replace(/_/g, " "),

    matchedLanguage:
      match.matchedLanguage,

    explanation:
      match.definition,

    relatedStyles:
      match.related

  };

}


/*
 * ============================================================
 * STYLE NORMALIZATION
 * ============================================================
 *
 * We distinguish:
 *
 * PRIMARY STYLE
 *    One meaningful normalized term for downstream functions.
 *
 * SUPPORTING STYLE SIGNALS
 *    Additional compatible descriptions.
 *
 * This prevents the downstream catalogue workflow from having
 * to interpret a long uncontrolled customer sentence.
 * ============================================================
 */

function normalizeCustomerStyle(input) {

  var explicitStyle =
    normalizeStyleText(
      input.style
    );

  var styleDetails =
    normalizeStyleText(
      input.styleDetails
    );

  var request =
    normalizeStyleText(
      input.request
    );

  var combined =
    [
      explicitStyle,
      styleDetails,
      request
    ].join(" ");


  var matches =
    findStyleMatches(
      combined
    );


  /*
   * If the customer explicitly supplied a canonical style,
   * prioritize it.
   */

  if (explicitStyle) {

    var explicitMatches =
      findStyleMatches(
        explicitStyle
      );

    if (explicitMatches.length) {

      return {

        primaryStyle:
          explicitMatches[0].style,

        supportingStyles:
          explicitMatches
            .slice(1, 5)
            .map(function(match) {
              return match.style;
            }),

        matches:
          explicitMatches

      };

    }

  }


  /*
   * Otherwise use the strongest semantic match found in the
   * customer's language.
   */

  if (matches.length) {

    return {

      primaryStyle:
        matches[0].style,

      supportingStyles:
        matches
          .slice(1, 5)
          .map(function(match) {
            return match.style;
          }),

      matches:
        matches

    };

  }


  return {

    primaryStyle:
      "",

    supportingStyles:
      [],

    matches:
      []

  };

}


/*
 * ============================================================
 * CATALOGUE TEXT HELPERS
 * ============================================================
 */

function getStyleCollectionText(collection) {

  if (
    !collection ||
    typeof collection !== "object"
  ) {

    return {

      primary: "",
      secondary: "",
      all: ""

    };

  }

  var primaryParts = [

    collection.title,
    collection.name

  ];

  var secondaryParts = [

    collection.handle,
    collection.type,
    collection.tags,
    collection.description,
    collection.descriptionHtml

  ];

  return {

    primary:
      normalizeStyleText(
        primaryParts.join(" ")
      ),

    secondary:
      normalizeStyleText(
        secondaryParts.join(" ")
      ),

    all:
      normalizeStyleText(
        primaryParts
          .concat(secondaryParts)
          .join(" ")
      )

  };

}


function getStyleProductText(product) {

  if (
    !product ||
    typeof product !== "object"
  ) {

    return {

      primary: "",
      secondary: "",
      all: ""

    };

  }

  var primaryParts = [

    product.title,
    product.name

  ];

  var secondaryParts = [

    product.handle,
    product.productType,
    product.type,
    product.tags,
    product.description,
    product.descriptionHtml

  ];


  /*
   * Current collection information.
   */

  if (
    Array.isArray(
      product.collections
    )
  ) {

    for (
      var i = 0;
      i < product.collections.length;
      i++
    ) {

      var collection =
        product.collections[i];

      if (
        typeof collection ===
        "string"
      ) {

        secondaryParts.push(
          collection
        );

      }

      else if (
        collection &&
        typeof collection ===
        "object"
      ) {

        secondaryParts.push(

          collection.title,
          collection.name,
          collection.handle,
          collection.description,
          collection.descriptionHtml,
          collection.tags

        );

      }

    }

  }


  /*
   * Image metadata only.
   *
   * No pixel-level visual claim.
   */

  if (
    Array.isArray(
      product.images
    )
  ) {

    for (
      var j = 0;
      j < product.images.length;
      j++
    ) {

      var image =
        product.images[j];

      if (
        image &&
        typeof image ===
        "object"
      ) {

        secondaryParts.push(

          image.alt,
          image.altText,
          image.title

        );

      }

    }

  }


  return {

    primary:
      normalizeStyleText(
        primaryParts.join(" ")
      ),

    secondary:
      normalizeStyleText(
        secondaryParts.join(" ")
      ),

    all:
      normalizeStyleText(
        primaryParts
          .concat(secondaryParts)
          .join(" ")
      )

  };

}


/*
 * ============================================================
 * TERM COUNTING
 * ============================================================
 */

function countStyleMatches(
  text,
  styleNames
) {

  if (
    !text ||
    !styleNames ||
    !styleNames.length
  ) {

    return 0;

  }

  var count = 0;

  for (
    var i = 0;
    i < styleNames.length;
    i++
  ) {

    var styleName =
      styleNames[i];

    var entry =
      jewelleryStyleVocabulary[
        styleName
      ];

    if (!entry) {
      continue;
    }

    var aliases =
      entry.aliases || [];

    var found = false;

    for (
      var j = 0;
      j < aliases.length;
      j++
    ) {

      var alias =
        normalizeStyleText(
          aliases[j]
        );

      if (
        alias &&
        text.indexOf(alias) !== -1
      ) {

        found = true;
        break;

      }

    }

    if (!found) {

      var canonical =
        normalizeStyleText(
          styleName.replace(/_/g, " ")
        );

      if (
        canonical &&
        text.indexOf(canonical) !== -1
      ) {

        found = true;

      }

    }

    if (found) {
      count++;
    }

  }

  return count;

}


/*
 * ============================================================
 * COLLECTION SCORING
 * ============================================================
 *
 * PRIMARY:
 *    Collection title/name
 *
 * SECONDARY:
 *    Collection description, tags, type, handle
 *
 * This means the actual collection remains the main
 * catalogue-discovery signal while its description helps
 * determine whether the collection really represents the
 * customer's requested style.
 * ============================================================
 */

function scoreStyleCollection(
  collection,
  normalizedStyles
) {

  var text =
    getStyleCollectionText(
      collection
    );

  var styleNames = [];

  if (
    normalizedStyles.primaryStyle
  ) {

    styleNames.push(
      normalizedStyles.primaryStyle
    );

  }

  for (
    var i = 0;
    i < normalizedStyles.supportingStyles.length;
    i++
  ) {

    if (
      styleNames.indexOf(
        normalizedStyles.supportingStyles[i]
      ) === -1
    ) {

      styleNames.push(
        normalizedStyles.supportingStyles[i]
      );

    }

  }


  var score = 0;
  var reasons = [];


  /*
   * Collection title/name.
   */

  var primaryMatches =
    countStyleMatches(
      text.primary,
      styleNames
    );

  if (primaryMatches > 0) {

    score +=
      primaryMatches * 45;

    reasons.push(
      "Collection title/name supports the normalized style."
    );

  }


  /*
   * Collection description and metadata.
   */

  var secondaryMatches =
    countStyleMatches(
      text.secondary,
      styleNames
    );

  if (secondaryMatches > 0) {

    score +=
      secondaryMatches * 20;

    reasons.push(
      "Collection description or metadata supports the style."
    );

  }


  return {

    score: score,

    reasons: reasons

  };

}


/*
 * ============================================================
 * PRODUCT SCORING
 * ============================================================
 */

function scoreStyleProduct(
  product,
  normalizedStyles,
  relevantCollectionIds
) {

  var text =
    getStyleProductText(
      product
    );

  var styleNames = [];

  if (
    normalizedStyles.primaryStyle
  ) {

    styleNames.push(
      normalizedStyles.primaryStyle
    );

  }

  for (
    var i = 0;
    i < normalizedStyles.supportingStyles.length;
    i++
  ) {

    if (
      styleNames.indexOf(
        normalizedStyles.supportingStyles[i]
      ) === -1
    ) {

      styleNames.push(
        normalizedStyles.supportingStyles[i]
      );

    }

  }


  var score = 0;
  var reasons = [];


  /*
   * Product collection membership.
   */

  var collectionMatch =
    false;

  if (
    Array.isArray(
      product.collections
    ) &&
    relevantCollectionIds.length
  ) {

    for (
      var c = 0;
      c < product.collections.length;
      c++
    ) {

      var collection =
        product.collections[c];

      var collectionId = "";

      if (
        typeof collection ===
        "string"
      ) {

        collectionId =
          collection;

      }

      else if (
        collection &&
        typeof collection ===
        "object"
      ) {

        collectionId =
          collection.id ||
          collection.collectionId ||
          collection.handle ||
          collection.title ||
          collection.name ||
          "";

      }


      for (
        var r = 0;
        r < relevantCollectionIds.length;
        r++
      ) {

        if (
          String(collectionId)
            .toLowerCase() ===
          String(
            relevantCollectionIds[r]
          ).toLowerCase()
        ) {

          collectionMatch =
            true;

          break;

        }

      }

      if (collectionMatch) {
        break;
      }

    }

  }


  if (collectionMatch) {

    score += 35;

    reasons.push(
      "Product belongs to a collection relevant to the normalized style."
    );

  }


  /*
   * Product title/name.
   */

  var primaryMatches =
    countStyleMatches(
      text.primary,
      styleNames
    );

  if (primaryMatches > 0) {

    score +=
      primaryMatches * 20;

    reasons.push(
      "Product title/name supports the normalized style."
    );

  }


  /*
   * Product description and metadata.
   */

  var secondaryMatches =
    countStyleMatches(
      text.secondary,
      styleNames
    );

  if (secondaryMatches > 0) {

    score +=
      secondaryMatches * 8;

    reasons.push(
      "Product description or metadata supports the style."
    );

  }


  return {

    score: score,

    reasons: reasons

  };

}


/*
 * ============================================================
 * ARRAY EXTRACTION
 * ============================================================
 */

function extractStyleDataArray(
  response
) {

  if (!response) {
    return [];
  }

  var data =
    response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.items)
  ) {

    return data.items;

  }

  if (
    data &&
    Array.isArray(data.collections)
  ) {

    return data.collections;

  }

  if (
    data &&
    Array.isArray(data.products)
  ) {

    return data.products;

  }

  return [];

}


/*
 * ============================================================
 * IDENTIFIER
 * ============================================================
 */

function getStyleItemIdentifier(
  item
) {

  if (
    !item ||
    typeof item !== "object"
  ) {

    return "";

  }

  return String(

    item.id ||
    item.collectionId ||
    item.productId ||
    item.handle ||
    item.title ||
    item.name ||
    ""

  );

}


/*
 * ============================================================
 * STYLE CATALOGUE DISCOVERY
 * ============================================================
 */

async function discoverStyleCatalogue(
  input,
  normalizedStyles
) {

  if (
    input.catalogueDiscovery ===
    false
  ) {

    return {

      performed: false,

      status: "not_requested",

      normalizedStyle:
        normalizedStyles.primaryStyle ||
        null,

      supportingStyles:
        normalizedStyles.supportingStyles,

      relevantCollections: [],

      relevantProducts: [],

      reason:
        "Catalogue discovery was not requested."

    };

  }


  if (
    !window.GodreryToneWebMCP ||
    !window.GodreryToneWebMCP.data ||
    typeof
      window.GodreryToneWebMCP.data.invoke !==
      "function"
  ) {

    return {

      performed: false,

      status: "unknown",

      normalizedStyle:
        normalizedStyles.primaryStyle ||
        null,

      supportingStyles:
        normalizedStyles.supportingStyles,

      relevantCollections: [],

      relevantProducts: [],

      reason:
        "The current catalogue data adapter is not available."

    };

  }


  var GT =
    window.GodreryToneWebMCP;


  /*
   * ----------------------------------------------------------
   * CURRENT COLLECTIONS
   * ----------------------------------------------------------
   */

  var collectionsResponse;

  try {

    collectionsResponse =
      await GT.data.invoke(
        "getCollections",
        {
          includeDescriptions: true,
          includeTags: true
        }
      );

  }

  catch (error) {

    collectionsResponse = {

      status: "unknown",

      data: null

    };

  }


  var collections =
    extractStyleDataArray(
      collectionsResponse
    );


  /*
   * ----------------------------------------------------------
   * CURRENT PRODUCTS
   * ----------------------------------------------------------
   */

  var productsResponse;

  try {

    productsResponse =
      await GT.data.getProducts({

        includeCollections: true,

        includeDescriptions: true,

        includeTags: true,

        includeImages: true

      });

  }

  catch (error2) {

    productsResponse = {

      status: "unknown",

      data: null

    };

  }


  var products =
    extractStyleDataArray(
      productsResponse
    );


  /*
   * ----------------------------------------------------------
   * SCORE COLLECTIONS
   * ----------------------------------------------------------
   */

  var scoredCollections = [];

  for (
    var i = 0;
    i < collections.length;
    i++
  ) {

    var collection =
      collections[i];

    var collectionScore =
      scoreStyleCollection(
        collection,
        normalizedStyles
      );

    if (
      collectionScore.score <= 0
    ) {

      continue;

    }

    scoredCollections.push({

      item: collection,

      score:
        collectionScore.score,

      reasons:
        collectionScore.reasons

    });

  }


  scoredCollections.sort(
    function(a, b) {

      return b.score - a.score;

    }
  );


  var selectedCollections =
    scoredCollections.slice(
      0,
      10
    );


  var relevantCollectionIds =
    [];

  for (
    var j = 0;
    j < selectedCollections.length;
    j++
  ) {

    var id =
      getStyleItemIdentifier(
        selectedCollections[j].item
      );

    if (id) {

      relevantCollectionIds.push(
        id
      );

    }

  }


  /*
   * ----------------------------------------------------------
   * SCORE PRODUCTS
   * ----------------------------------------------------------
   */

  var scoredProducts = [];

  for (
    var p = 0;
    p < products.length;
    p++
  ) {

    var product =
      products[p];

    var productScore =
      scoreStyleProduct(
        product,
        normalizedStyles,
        relevantCollectionIds
      );

    if (
      productScore.score <= 0
    ) {

      continue;

    }

    scoredProducts.push({

      item: product,

      score:
        productScore.score,

      reasons:
        productScore.reasons

    });

  }


  scoredProducts.sort(
    function(a, b) {

      return b.score - a.score;

    }
  );


  var selectedProducts =
    scoredProducts.slice(
      0,
      20
    );


  /*
   * ----------------------------------------------------------
   * SOURCE STATUS
   * ----------------------------------------------------------
   */

  var collectionsAvailable =
    collectionsResponse &&
    collectionsResponse.status ===
      "ok";

  var productsAvailable =
    productsResponse &&
    productsResponse.status ===
      "ok";


  if (
    !collectionsAvailable &&
    !productsAvailable
  ) {

    return {

      performed: true,

      status: "unknown",

      normalizedStyle:
        normalizedStyles.primaryStyle ||
        null,

      supportingStyles:
        normalizedStyles.supportingStyles,

      relevantCollections: [],

      relevantProducts: [],

      reason:
        "Current catalogue data could not be established."

    };

  }


  /*
   * ----------------------------------------------------------
   * FORMAT COLLECTION RESULTS
   * ----------------------------------------------------------
   */

  var formattedCollections =
    [];

  for (
    var c = 0;
    c < selectedCollections.length;
    c++
  ) {

    var collectionResult =
      selectedCollections[c];

    var collectionItem =
      collectionResult.item;

    formattedCollections.push({

      id:
        collectionItem.id ||
        collectionItem.collectionId ||
        null,

      title:
        collectionItem.title ||
        collectionItem.name ||
        null,

      handle:
        collectionItem.handle ||
        null,

      score:
        collectionResult.score,

      reasons:
        collectionResult.reasons

    });

  }


  /*
   * ----------------------------------------------------------
   * FORMAT PRODUCT RESULTS
   * ----------------------------------------------------------
   */

  var formattedProducts =
    [];

  for (
    var q = 0;
    q < selectedProducts.length;
    q++
  ) {

    var productResult =
      selectedProducts[q];

    var productItem =
      productResult.item;

    formattedProducts.push({

      id:
        productItem.id ||
        productItem.productId ||
        null,

      title:
        productItem.title ||
        productItem.name ||
        null,

      handle:
        productItem.handle ||
        null,

      score:
        productResult.score,

      reasons:
        productResult.reasons

    });

  }


  var status =
    (
      formattedCollections.length ||
      formattedProducts.length
    )
      ? "matched"
      : "no_match";


  return {

    performed: true,

    status: status,

    normalizedStyle:
      normalizedStyles.primaryStyle ||
      null,

    supportingStyles:
      normalizedStyles.supportingStyles,

    relevantCollections:
      formattedCollections,

    relevantProducts:
      formattedProducts,

    reason:
      status === "matched"

        ? "Current Shopify collections were evaluated as the primary catalogue-discovery signal, with collection descriptions and product metadata used to refine the style match."

        : "The current Shopify catalogue was inspected, but no sufficiently relevant collection or product candidate was identified."

  };

}


/*
 * ============================================================
 * CREATE STYLE RESULT
 * ============================================================
 */

async function createStyleResult(
  input
) {

  input =
    input || {};


  var request =
    cleanStyleValue(
      input.request
    );


  var style =
    cleanStyleValue(
      input.style
    );


  var styleDetails =
    cleanStyleValue(
      input.styleDetails
    );


  var styleCertainty =
    normalizeStyleCertainty(
      input.styleCertainty
    );


  var isStyleQuestion =
    input.styleQuestion === true ||
    detectStyleQuestion(input);


  var explanation =
    null;


  if (
    isStyleQuestion ||
    input.explainStyle === true
  ) {

    explanation =
      explainRequestedStyle(
        input
      );

  }


  var normalizedStyles =
    normalizeCustomerStyle({

      request:
        request,

      style:
        style,

      styleDetails:
        styleDetails

    });


  /*
   * If the customer is only asking for a definition and has
   * not requested catalogue discovery, don't force catalogue
   * matching.
   */

  var shouldDiscoverCatalogue =
    input.catalogueDiscovery !== false &&
    (
      !isStyleQuestion ||
      input.catalogueDiscovery === true
    );


  var catalogueDiscovery;

  try {

    catalogueDiscovery =
      await discoverStyleCatalogue(

        {
          request:
            request,

          style:
            style,

          styleDetails:
            styleDetails,

          catalogueDiscovery:
            shouldDiscoverCatalogue

        },

        normalizedStyles

      );

  }

  catch (error) {

    catalogueDiscovery = {

      performed: false,

      status: "unknown",

      normalizedStyle:
        normalizedStyles.primaryStyle ||
        null,

      supportingStyles:
        normalizedStyles.supportingStyles,

      relevantCollections: [],

      relevantProducts: [],

      reason:
        "Style catalogue discovery could not be completed."

    };

  }


  /*
   * ----------------------------------------------------------
   * FINAL STYLE
   * ----------------------------------------------------------
   *
   * Prefer the explicit style if it can be normalized.
   * Otherwise use the semantic interpretation.
   */

  var normalizedPrimaryStyle =
    normalizedStyles.primaryStyle ||
    "";


  /*
   * If the tool can normalize the explicit style but the
   * caller did not provide a certainty value, infer it.
   */

  if (
    normalizedPrimaryStyle &&
    style &&
    styleCertainty === "unknown"
  ) {

    styleCertainty =
      "explicit";

  }

  else if (
    normalizedPrimaryStyle &&
    !style &&
    styleCertainty === "unknown"
  ) {

    styleCertainty =
      "inferred";

  }


  return {

    success: true,

    brand:
      "GodreryTone",


    styleIntent: {

      request:
        request,

      style:
        normalizedPrimaryStyle
          ? normalizedPrimaryStyle.replace(
              /_/g,
              " "
            )
          : null,

      styleDetails:
        styleDetails || null,

      styleCertainty:
        styleCertainty,

      supportingStyles:
        normalizedStyles.supportingStyles
          .map(function(styleName) {

            return styleName.replace(
              /_/g,
              " "
            );

          }),

      customerLanguage:
        style || null

    },


    styleEducation: {

      requested:
        isStyleQuestion,

      available:
        explanation
          ? explanation.available
          : false,

      term:
        explanation
          ? explanation.term
          : null,

      matchedLanguage:
        explanation
          ? explanation.matchedLanguage || null
          : null,

      explanation:
        explanation
          ? explanation.explanation
          : null,

      relatedStyles:
        explanation
          ? explanation.relatedStyles.map(
              function(styleName) {

                return styleName.replace(
                  /_/g,
                  " "
                );

              }
            )
          : []

    },


    catalogueDiscovery:
      catalogueDiscovery,


    guidance: [

      "Use the customer's explicit style preference when provided.",

      "Translate ordinary customer language into the closest meaningful jewellery-style term when the intended meaning can reasonably be established.",

      "Use one normalized primary style for downstream catalogue and recommendation functions while preserving compatible supporting style signals.",

      "Do not force a style classification when the customer's meaning is genuinely unclear.",

      "When a customer asks what a jewellery-style term means, explain the term clearly before treating it as a shopping preference.",

      "Do not confuse jewellery style with jewellery category, material, gemstone, colour, size, price, recipient, occasion, market, or shipping information.",

      "Use current Shopify collections as the primary catalogue-discovery signal.",

      "Use collection descriptions and metadata to refine whether a collection genuinely represents the requested style.",

      "Use product collection membership, product titles, descriptions, tags and available metadata as secondary style evidence.",

      "Image URLs and image metadata may be considered when available, but do not claim pixel-level visual interpretation unless a vision-capable service is actually connected.",

      "Do not invent current products, collections, vendors, markets, countries, prices or availability.",

      "Catalogue relevance does not establish destination eligibility or shipping eligibility.",

      "Do not make a purchase decision on behalf of the customer."

    ],


    nextStep:
      "Pass the normalized style together with compatible supporting style signals to the recommendation and catalogue-search workflow, where later tools can apply category, recipient, market, supplier, availability, shipping and pricing rules."

  };

}


/*
 * ============================================================
 * REGISTER TOOL
 * ============================================================
 */

try {

  if (
    typeof document !== "undefined" &&
    document.modelContext &&
    typeof document.modelContext.registerTool ===
      "function"
  ) {

    document.modelContext.registerTool({

      name:
        "godrerytone_style",


      description:
        "Understand and normalize jewellery style from natural customer language. Translate everyday descriptions into meaningful standardized jewellery-style terms, explain jewellery-style terminology when customers ask what a term means, preserve compatible supporting style signals, and inspect the current Shopify catalogue for relevant collections and products. Collection matches are the primary catalogue-discovery signal, while collection descriptions and product metadata provide semantic refinement. Do not invent missing preferences or current catalogue data, change markets, determine destination eligibility, determine shipping, determine final pricing, or make purchasing decisions.",


      inputSchema:
        styleSchema,


      execute:
        async function(input) {

          return JSON.stringify(

            await createStyleResult(
              input
            )

          );

        }

    });


    console.info(
      "[GodreryTone WebMCP] Tool 3 style registered successfully."
    );

  }

  else {

    console.info(
      "[GodreryTone WebMCP] WebMCP modelContext is not available for Tool 3."
    );

  }

}

catch (error) {

  console.error(
    "[GodreryTone WebMCP] Style tool registration failed:",
    error
  );

}
/*
 * ============================================================
 * GODRERYTONE WEBMCP
 * TOOL 4 — RECIPIENT + AGE
 * ============================================================
 *
 * PURPOSE
 * ------------------------------------------------------------
 * Understand who the jewellery is intended for.
 *
 * The tool:
 * - identifies and normalizes recipient relationships
 * - identifies recipient gender when explicitly stated or
 *   reasonably implied by an unambiguous relationship
 * - preserves the customer's original wording
 * - captures age only when provided
 * - treats age as optional and conditional
 * - uses recipient information as a refinement signal
 * - preserves explicit customer style preferences
 * - can inspect the current Shopify catalogue for relevant
 *   recipient/gender signals
 *
 * IMPORTANT
 * ------------------------------------------------------------
 * Gender is a strong recipient signal, but NOT a blanket
 * product filter.
 *
 * Some GodreryTone jewellery may be:
 * - female-oriented
 * - male-oriented
 * - unisex
 * - gender-neutral
 * - unknown
 *
 * Faith-related jewellery, watches, symbolic jewellery,
 * personalized jewellery and other products may apply to
 * multiple genders.
 *
 * Therefore:
 * - Recipient gender may guide discovery.
 * - Actual product/collection data determines applicability.
 * - This tool does NOT make final product decisions.
 *
 * Age is NOT treated as a mandatory recommendation signal.
 * Age only becomes influential when explicitly relevant.
 *
 * This tool does NOT:
 * - determine Shopify market
 * - determine destination eligibility
 * - determine shipping
 * - determine final pricing
 * - make the purchase decision
 * ============================================================
 */

var recipientToolName = "godrerytone_recipient";

var recipientSchema = {
  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request."
    },

    recipient: {
      type: "string",
      description:
        "Who the jewellery is intended for, such as wife, husband, girlfriend, boyfriend, mother, father, daughter, son, sister, brother, friend, colleague, bride, groom, partner, self, or another recipient."
    },

    recipientRelationship: {
      type: "string",
      description:
        "The relationship between the customer and recipient when provided or reasonably identifiable."
    },

    recipientType: {
      type: "string",
      enum: [
        "self",
        "partner",
        "spouse",
        "romantic_partner",
        "parent",
        "child",
        "sibling",
        "friend",
        "colleague",
        "professional",
        "bride",
        "groom",
        "family",
        "other",
        "unknown"
      ],
      description:
        "A normalized recipient relationship category."
    },

    recipientCertainty: {
      type: "string",
      enum: [
        "explicit",
        "inferred",
        "unknown"
      ],
      description:
        "How confidently the recipient was identified."
    },

    gender: {
      type: "string",
      enum: [
        "female",
        "male",
        "unisex",
        "unknown"
      ],
      description:
        "The recipient's gender when explicitly provided or reasonably inferred from an unambiguous recipient relationship. Never invent gender."
    },

    genderCertainty: {
      type: "string",
      enum: [
        "explicit",
        "inferred",
        "unknown"
      ],
      description:
        "How confidently the recipient gender was identified."
    },

    recipientLanguage: {
      type: "string",
      description:
        "The customer's original wording describing the recipient."
    },

    recipientAge: {
      type: "number",
      description:
        "The recipient's exact age when explicitly provided. Never invent an age."
    },

    recipientAgeRange: {
      type: "string",
      description:
        "The recipient's approximate age range when provided instead of an exact age."
    },

    ageRelevant: {
      type: "boolean",
      description:
        "Whether the customer explicitly indicates that age should influence the jewellery recommendation."
    },

    ageCertainty: {
      type: "string",
      enum: [
        "explicit",
        "inferred",
        "unknown"
      ],
      description:
        "How confidently the age relevance was established."
    },

    style: {
      type: "string",
      description:
        "The customer's preferred jewellery style when already known. Style remains a stronger aesthetic preference signal than recipient relationship or age."
    },

    occasion: {
      type: "string",
      description:
        "The occasion or context when already known."
    },

    category: {
      type: "string",
      description:
        "The jewellery category when already known."
    },

    budget: {
      type: "number",
      description:
        "The customer's stated target or maximum budget when already known."
    },

    budgetCurrency: {
      type: "string",
      description:
        "The customer's explicitly stated budget currency when already known."
    },

    catalogueDiscovery: {
      type: "boolean",
      description:
        "Whether to inspect the current Shopify catalogue for recipient-related collection and product signals. Defaults to true."
    }

  },

  required: [
    "request"
  ]
};


/* ============================================================
 * CLEANING HELPERS
 * ============================================================
 */

function cleanRecipientValue(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "string") {
    var trimmed = value.trim();

    return trimmed === ""
      ? null
      : trimmed;
  }

  return value;
}


function normalizeRecipientText(value) {

  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ============================================================
 * RECIPIENT SEMANTIC VOCABULARY
 * ============================================================
 *
 * This is stable semantic knowledge.
 * It is NOT current Shopify catalogue data.
 * ============================================================
 */

var recipientVocabulary = [

  {
    type: "self",
    canonical: "self",
    aliases: [
      "myself",
      "me",
      "for me",
      "for myself"
    ],
    gender: "unknown"
  },

  {
    type: "spouse",
    canonical: "wife",
    aliases: [
      "wife",
      "my wife",
      "wifey"
    ],
    gender: "female"
  },

  {
    type: "spouse",
    canonical: "husband",
    aliases: [
      "husband",
      "my husband"
    ],
    gender: "male"
  },

  {
    type: "romantic_partner",
    canonical: "girlfriend",
    aliases: [
      "girlfriend",
      "my girlfriend",
      "gf"
    ],
    gender: "female"
  },

  {
    type: "romantic_partner",
    canonical: "boyfriend",
    aliases: [
      "boyfriend",
      "my boyfriend",
      "bf"
    ],
    gender: "male"
  },

  {
    type: "partner",
    canonical: "partner",
    aliases: [
      "partner",
      "my partner",
      "significant other",
      "my significant other",
      "better half",
      "my better half"
    ],
    gender: "unknown"
  },

  {
    type: "parent",
    canonical: "mother",
    aliases: [
      "mother",
      "my mother",
      "mum",
      "my mum",
      "mom",
      "my mom",
      "mummy",
      "mommy",
      "mama"
    ],
    gender: "female"
  },

  {
    type: "parent",
    canonical: "father",
    aliases: [
      "father",
      "my father",
      "dad",
      "my dad",
      "daddy",
      "my daddy"
    ],
    gender: "male"
  },

  {
    type: "child",
    canonical: "daughter",
    aliases: [
      "daughter",
      "my daughter",
      "little girl",
      "my girl"
    ],
    gender: "female"
  },

  {
    type: "child",
    canonical: "son",
    aliases: [
      "son",
      "my son",
      "little boy",
      "my boy"
    ],
    gender: "male"
  },

  {
    type: "sibling",
    canonical: "sister",
    aliases: [
      "sister",
      "my sister"
    ],
    gender: "female"
  },

  {
    type: "sibling",
    canonical: "brother",
    aliases: [
      "brother",
      "my brother"
    ],
    gender: "male"
  },

  {
    type: "friend",
    canonical: "friend",
    aliases: [
      "friend",
      "my friend",
      "best friend",
      "my best friend"
    ],
    gender: "unknown"
  },

  {
    type: "colleague",
    canonical: "colleague",
    aliases: [
      "colleague",
      "my colleague",
      "coworker",
      "co-worker",
      "workmate"
    ],
    gender: "unknown"
  },

  {
    type: "professional",
    canonical: "boss",
    aliases: [
      "boss",
      "my boss",
      "manager",
      "my manager"
    ],
    gender: "unknown"
  },

  {
    type: "bride",
    canonical: "bride",
    aliases: [
      "bride",
      "the bride",
      "my bride"
    ],
    gender: "female"
  },

  {
    type: "groom",
    canonical: "groom",
    aliases: [
      "groom",
      "the groom",
      "my groom"
    ],
    gender: "male"
  },

  {
    type: "family",
    canonical: "family",
    aliases: [
      "family",
      "my family",
      "family member",
      "relative",
      "relative"
    ],
    gender: "unknown"
  }

];


/* ============================================================
 * RECIPIENT MATCHING
 * ============================================================
 */

function findRecipientMatch(text) {

  var normalized = normalizeRecipientText(text);

  if (!normalized) {
    return null;
  }

  var bestMatch = null;
  var bestLength = 0;

  for (var i = 0; i < recipientVocabulary.length; i++) {

    var entry = recipientVocabulary[i];

    for (var j = 0; j < entry.aliases.length; j++) {

      var alias = normalizeRecipientText(
        entry.aliases[j]
      );

      if (!alias) {
        continue;
      }

      if (
        normalized === alias ||
        normalized.indexOf(alias) !== -1
      ) {

        if (alias.length > bestLength) {

          bestMatch = {
            canonical: entry.canonical,
            type: entry.type,
            gender: entry.gender,
            matchedLanguage: entry.aliases[j]
          };

          bestLength = alias.length;
        }
      }
    }
  }

  return bestMatch;
}


/* ============================================================
 * EXPLICIT GENDER DETECTION
 * ============================================================
 */

function detectExplicitGender(text) {

  var normalized = normalizeRecipientText(text);

  if (!normalized) {
    return null;
  }

  var femaleTerms = [
    "female",
    "woman",
    "women",
    "girl",
    "lady",
    "ladies",
    "she",
    "her"
  ];

  var maleTerms = [
    "male",
    "man",
    "men",
    "boy",
    "gentleman",
    "gentlemen",
    "he",
    "him"
  ];

  for (var i = 0; i < femaleTerms.length; i++) {

    if (
      normalized === femaleTerms[i] ||
      normalized.indexOf(" " + femaleTerms[i] + " ") !== -1
    ) {
      return "female";
    }
  }

  for (var j = 0; j < maleTerms.length; j++) {

    if (
      normalized === maleTerms[j] ||
      normalized.indexOf(" " + maleTerms[j] + " ") !== -1
    ) {
      return "male";
    }
  }

  return null;
}


/* ============================================================
 * AGE HELPERS
 * ============================================================
 */

function hasValue(value) {

  return !(
    value === undefined ||
    value === null ||
    value === ""
  );
}


function normalizeAgeRelevance(input, request) {

  if (input.ageRelevant === true) {
    return {
      relevant: true,
      certainty: "explicit"
    };
  }

  var normalized = normalizeRecipientText(
    request || ""
  );

  var ageSignals = [
    "age appropriate",
    "age-appropriate",
    "for a teenager",
    "for teenagers",
    "for a teen",
    "for teens",
    "for a young girl",
    "for a young boy",
    "for an older woman",
    "for an older man",
    "for an elderly",
    "for a child",
    "for children",
    "for kids",
    "for a kid"
  ];

  for (var i = 0; i < ageSignals.length; i++) {

    if (
      normalized.indexOf(
        normalizeRecipientText(ageSignals[i])
      ) !== -1
    ) {

      return {
        relevant: true,
        certainty: "inferred"
      };
    }
  }

  return {
    relevant: false,
    certainty: "unknown"
  };
}


/* ============================================================
 * AGE RANGE INTERPRETATION
 * ============================================================
 */

function detectAgeRange(request) {

  var text = normalizeRecipientText(request);

  if (!text) {
    return null;
  }

  var ranges = [
    {
      pattern: /\bteenager(s)?\b/,
      value: "teenager"
    },
    {
      pattern: /\bteen(s)?\b/,
      value: "teenager"
    },
    {
      pattern: /\bchild(ren)?\b/,
      value: "child"
    },
    {
      pattern: /\bkid(s)?\b/,
      value: "child"
    },
    {
      pattern: /\byoung adult(s)?\b/,
      value: "young adult"
    },
    {
      pattern: /\badult(s)?\b/,
      value: "adult"
    },
    {
      pattern: /\byoung\b/,
      value: "young"
    },
    {
      pattern: /\bold(er)?\b/,
      value: "older"
    }
  ];

  for (var i = 0; i < ranges.length; i++) {

    if (ranges[i].pattern.test(text)) {
      return ranges[i].value;
    }
  }

  return null;
}


/* ============================================================
 * CATALOGUE TEXT HELPERS
 * ============================================================
 */

function getRecipientCollectionText(collection) {

  if (!collection) {
    return "";
  }

  var parts = [];

  if (collection.title) {
    parts.push(String(collection.title));
  }

  if (collection.name) {
    parts.push(String(collection.name));
  }

  if (collection.description) {
    parts.push(String(collection.description));
  }

  if (collection.handle) {
    parts.push(String(collection.handle));
  }

  if (collection.tags) {

    if (Array.isArray(collection.tags)) {
      parts = parts.concat(collection.tags);
    } else {
      parts.push(String(collection.tags));
    }
  }

  if (collection.metadata) {

    try {
      parts.push(
        typeof collection.metadata === "string"
          ? collection.metadata
          : JSON.stringify(collection.metadata)
      );
    } catch (error) {}
  }

  return normalizeRecipientText(
    parts.join(" ")
  );
}


function getRecipientProductText(product) {

  if (!product) {
    return "";
  }

  var parts = [];

  if (product.title) {
    parts.push(String(product.title));
  }

  if (product.name) {
    parts.push(String(product.name));
  }

  if (product.description) {
    parts.push(String(product.description));
  }

  if (product.handle) {
    parts.push(String(product.handle));
  }

  if (product.vendor) {
    parts.push(String(product.vendor));
  }

  if (product.productType) {
    parts.push(String(product.productType));
  }

  if (product.tags) {

    if (Array.isArray(product.tags)) {
      parts = parts.concat(product.tags);
    } else {
      parts.push(String(product.tags));
    }
  }

  if (product.collections) {

    if (Array.isArray(product.collections)) {

      for (var i = 0; i < product.collections.length; i++) {

        var collection = product.collections[i];

        if (typeof collection === "string") {
          parts.push(collection);
        } else if (collection) {

          if (collection.title) {
            parts.push(collection.title);
          }

          if (collection.name) {
            parts.push(collection.name);
          }

          if (collection.handle) {
            parts.push(collection.handle);
          }

          if (collection.description) {
            parts.push(collection.description);
          }
        }
      }
    } else {
      parts.push(String(product.collections));
    }
  }

  if (product.images && Array.isArray(product.images)) {

    for (var j = 0; j < product.images.length; j++) {

      var image = product.images[j];

      if (!image) {
        continue;
      }

      if (image.alt) {
        parts.push(String(image.alt));
      }

      if (image.title) {
        parts.push(String(image.title));
      }
    }
  }

  if (product.metadata) {

    try {
      parts.push(
        typeof product.metadata === "string"
          ? product.metadata
          : JSON.stringify(product.metadata)
      );
    } catch (error) {}
  }

  return normalizeRecipientText(
    parts.join(" ")
  );
}


/* ============================================================
 * GENDER CATALOGUE SIGNALS
 * ============================================================
 *
 * These terms are semantic discovery signals only.
 *
 * They must NOT be treated as proof that every product
 * containing the term is exclusively male/female.
 * ============================================================
 */

var femaleCatalogueTerms = [
  "women",
  "woman",
  "womens",
  "women's",
  "ladies",
  "lady",
  "girls",
  "girl",
  "female",
  "her",
  "for her",
  "mother",
  "mum",
  "mom",
  "daughter",
  "sister",
  "wife",
  "girlfriend",
  "bride"
];

var maleCatalogueTerms = [
  "men",
  "man",
  "mens",
  "men's",
  "gentlemen",
  "gentleman",
  "boys",
  "boy",
  "male",
  "him",
  "for him",
  "father",
  "dad",
  "son",
  "brother",
  "husband",
  "boyfriend",
  "groom"
];

var crossGenderTerms = [
  "unisex",
  "for everyone",
  "for all",
  "gender neutral",
  "gender-neutral",
  "faith",
  "christian",
  "christianity",
  "religious",
  "symbolic",
  "personalized",
  "sentimental",
  "watch",
  "watches"
];


/* ============================================================
 * TERM SCORING
 * ============================================================
 */

function countTerms(text, terms) {

  if (!text || !terms || !terms.length) {
    return 0;
  }

  var score = 0;

  for (var i = 0; i < terms.length; i++) {

    var term = normalizeRecipientText(
      terms[i]
    );

    if (!term) {
      continue;
    }

    if (
      text === term ||
      text.indexOf(term) !== -1
    ) {
      score++;
    }
  }

  return score;
}


/* ============================================================
 * COLLECTION SCORING
 * ============================================================
 */

function scoreRecipientCollection(
  collection,
  targetGender,
  recipientText
) {

  var text = getRecipientCollectionText(
    collection
  );

  if (!text) {
    return {
      score: 0,
      reasons: []
    };
  }

  var score = 0;
  var reasons = [];

  var femaleScore = countTerms(
    text,
    femaleCatalogueTerms
  );

  var maleScore = countTerms(
    text,
    maleCatalogueTerms
  );

  var crossScore = countTerms(
    text,
    crossGenderTerms
  );

  var recipientMatch = recipientText
    ? countTerms(text, [
        recipientText
      ])
    : 0;

  if (targetGender === "female") {

    if (femaleScore > 0) {
      score += femaleScore * 15;
      reasons.push(
        "Contains female-oriented recipient signals."
      );
    }

    if (crossScore > 0) {
      score += crossScore * 12;
      reasons.push(
        "Contains potentially cross-gender catalogue signals."
      );
    }
  }

  if (targetGender === "male") {

    if (maleScore > 0) {
      score += maleScore * 15;
      reasons.push(
        "Contains male-oriented recipient signals."
      );
    }

    if (crossScore > 0) {
      score += crossScore * 12;
      reasons.push(
        "Contains potentially cross-gender catalogue signals."
      );
    }
  }

  if (
    targetGender === "unknown" ||
    !targetGender
  ) {

    if (crossScore > 0) {
      score += crossScore * 10;
      reasons.push(
        "Contains cross-gender or broadly applicable signals."
      );
    }
  }

  if (recipientMatch > 0) {

    score += recipientMatch * 20;

    reasons.push(
      "Contains recipient-related language."
    );
  }

  return {
    score: score,
    reasons: reasons
  };
}


/* ============================================================
 * PRODUCT SCORING
 * ============================================================
 */

function scoreRecipientProduct(
  product,
  targetGender,
  recipientText
) {

  var text = getRecipientProductText(
    product
  );

  if (!text) {
    return {
      score: 0,
      reasons: []
    };
  }

  var score = 0;
  var reasons = [];

  var femaleScore = countTerms(
    text,
    femaleCatalogueTerms
  );

  var maleScore = countTerms(
    text,
    maleCatalogueTerms
  );

  var crossScore = countTerms(
    text,
    crossGenderTerms
  );

  var recipientMatch = recipientText
    ? countTerms(text, [
        recipientText
      ])
    : 0;

  if (targetGender === "female") {

    if (femaleScore > 0) {
      score += femaleScore * 10;
      reasons.push(
        "Product metadata contains female-oriented recipient signals."
      );
    }

    if (crossScore > 0) {
      score += crossScore * 8;
      reasons.push(
        "Product metadata contains potentially cross-gender signals."
      );
    }
  }

  if (targetGender === "male") {

    if (maleScore > 0) {
      score += maleScore * 10;
      reasons.push(
        "Product metadata contains male-oriented recipient signals."
      );
    }

    if (crossScore > 0) {
      score += crossScore * 8;
      reasons.push(
        "Product metadata contains potentially cross-gender signals."
      );
    }
  }

  if (
    targetGender === "unknown" ||
    !targetGender
  ) {

    if (crossScore > 0) {
      score += crossScore * 8;
      reasons.push(
        "Product metadata contains broadly applicable signals."
      );
    }
  }

  if (recipientMatch > 0) {

    score += recipientMatch * 15;

    reasons.push(
      "Product metadata contains recipient-related language."
    );
  }

  return {
    score: score,
    reasons: reasons
  };
}


/* ============================================================
 * ARRAY EXTRACTION
 * ============================================================
 */

function extractRecipientDataArray(response) {

  if (!response) {
    return [];
  }

  var data = response.data;

  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.products)) {
    return data.products;
  }

  if (Array.isArray(data.collections)) {
    return data.collections;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}


/* ============================================================
 * IDENTIFIERS
 * ============================================================
 */

function getRecipientItemIdentifier(
  item,
  fallback
) {

  if (!item) {
    return fallback;
  }

  return (
    item.id ||
    item.handle ||
    item.title ||
    item.name ||
    fallback
  );
}


/* ============================================================
 * LIVE CATALOGUE DISCOVERY
 * ============================================================
 */

async function discoverRecipientCatalogue(
  targetGender,
  recipientText,
  input
) {

  var result = {
    performed: false,
    status: "unknown",
    targetGender: targetGender || "unknown",
    relevantCollections: [],
    relevantProducts: [],
    reason: null
  };

  if (
    input.catalogueDiscovery === false
  ) {

    result.reason =
      "Catalogue discovery was disabled by the caller.";

    return result;
  }

  if (
    !window.GodreryToneWebMCP ||
    !window.GodreryToneWebMCP.data
  ) {

    result.reason =
      "GodreryTone dynamic data layer is unavailable.";

    return result;
  }

  var GT =
    window.GodreryToneWebMCP;

  try {

    var collectionResponse =
      await GT.data.invoke(
        "getCollections",
        {
          includeDescriptions: true,
          includeTags: true
        }
      );

    var productResponse =
      await GT.data.getProducts({
        includeCollections: true,
        includeDescriptions: true,
        includeTags: true,
        includeImages: true
      });

    if (
      !collectionResponse ||
      collectionResponse.status !== "ok"
    ) {

      result.reason =
        "Current Shopify collection data could not be established.";

      return result;
    }

    if (
      !productResponse ||
      productResponse.status !== "ok"
    ) {

      result.reason =
        "Current Shopify product data could not be established.";

      return result;
    }

    result.performed = true;

    var collections =
      extractRecipientDataArray(
        collectionResponse
      );

    var products =
      extractRecipientDataArray(
        productResponse
      );

    for (
      var i = 0;
      i < collections.length;
      i++
    ) {

      var collection =
        collections[i];

      var collectionScore =
        scoreRecipientCollection(
          collection,
          targetGender,
          recipientText
        );

      if (
        collectionScore.score > 0
      ) {

        result.relevantCollections.push({
          id:
            getRecipientItemIdentifier(
              collection,
              "collection-" + i
            ),
          title:
            collection.title ||
            collection.name ||
            null,
          score:
            collectionScore.score,
          reasons:
            collectionScore.reasons
        });
      }
    }

    for (
      var j = 0;
      j < products.length;
      j++
    ) {

      var product =
        products[j];

      var productScore =
        scoreRecipientProduct(
          product,
          targetGender,
          recipientText
        );

      if (
        productScore.score > 0
      ) {

        result.relevantProducts.push({
          id:
            getRecipientItemIdentifier(
              product,
              "product-" + j
            ),
          title:
            product.title ||
            product.name ||
            null,
          score:
            productScore.score,
          reasons:
            productScore.reasons
        });
      }
    }

    result.relevantCollections.sort(
      function(a, b) {
        return b.score - a.score;
      }
    );

    result.relevantProducts.sort(
      function(a, b) {
        return b.score - a.score;
      }
    );

    result.relevantCollections =
      result.relevantCollections.slice(
        0,
        20
      );

    result.relevantProducts =
      result.relevantProducts.slice(
        0,
        30
      );

    if (
      result.relevantCollections.length ||
      result.relevantProducts.length
    ) {

      result.status = "matched";

      result.reason =
        "Current Shopify catalogue data was inspected for recipient and gender-related signals.";

    } else {

      result.status = "no_match";

      result.reason =
        "Current Shopify catalogue data was available, but no strong recipient-related signals were found.";
    }

    return result;

  } catch (error) {

    result.reason =
      "Catalogue discovery could not be completed reliably.";

    return result;
  }
}


/* ============================================================
 * MAIN RESULT
 * ============================================================
 */

async function createRecipientResult(
  input
) {

  input = input || {};

  var request =
    cleanRecipientValue(
      input.request
    );

  var explicitRecipient =
    cleanRecipientValue(
      input.recipient
    );

  var explicitRelationship =
    cleanRecipientValue(
      input.recipientRelationship
    );

  var sourceText =
    [
      request,
      explicitRecipient,
      explicitRelationship
    ]
      .filter(Boolean)
      .join(" ");

  var recipientMatch =
    findRecipientMatch(
      sourceText
    );

  var normalizedRecipient =
    explicitRecipient ||
    (
      recipientMatch
        ? recipientMatch.canonical
        : null
    );

  var recipientType =
    cleanRecipientValue(
      input.recipientType
    ) ||
    (
      recipientMatch
        ? recipientMatch.type
        : "unknown"
    );

  var recipientCertainty =
    cleanRecipientValue(
      input.recipientCertainty
    ) ||
    (
      explicitRecipient
        ? "explicit"
        : recipientMatch
        ? "inferred"
        : "unknown"
    );

  var explicitGender =
    cleanRecipientValue(
      input.gender
    );

  var detectedGender =
    detectExplicitGender(
      sourceText
    );

  var inferredGender =
    recipientMatch
      ? recipientMatch.gender
      : "unknown";

  var gender =
    explicitGender ||
    detectedGender ||
    inferredGender ||
    "unknown";

  var genderCertainty =
    cleanRecipientValue(
      input.genderCertainty
    ) ||
    (
      explicitGender || detectedGender
        ? "explicit"
        : inferredGender &&
          inferredGender !== "unknown"
        ? "inferred"
        : "unknown"
    );

  var ageProvided =
    hasValue(
      input.recipientAge
    );

  var ageRangeProvided =
    hasValue(
      input.recipientAgeRange
    );

  var detectedAgeRange =
    !ageRangeProvided
      ? detectAgeRange(request)
      : null;

  var ageRange =
    ageRangeProvided
      ? input.recipientAgeRange
      : detectedAgeRange;

  var ageRelevance =
    normalizeAgeRelevance(
      input,
      request
    );

  var style =
    cleanRecipientValue(
      input.style
    );

  var catalogueDiscovery =
    await discoverRecipientCatalogue(
      gender,
      normalizedRecipient,
      input
    );

  return {

    success: true,

    brand: "GodreryTone",

    recipientIntent: {

      request: request,

      recipient:
        normalizedRecipient,

      recipientLanguage:
        cleanRecipientValue(
          input.recipient
        ) ||
        (
          recipientMatch
            ? recipientMatch.matchedLanguage
            : null
        ),

      recipientRelationship:
        explicitRelationship ||
        normalizedRecipient,

      recipientType:
        recipientType,

      recipientCertainty:
        recipientCertainty,

      gender:
        gender,

      genderCertainty:
        genderCertainty,

      recipientAge:
        ageProvided
          ? input.recipientAge
          : null,

      recipientAgeRange:
        ageRange || null,

      ageRelevant:
        ageRelevance.relevant,

      ageCertainty:
        ageRelevance.certainty,

      recommendationRole:
        "refinement",

      stylePriority:
        style
          ? "Style remains the primary aesthetic preference signal."
          : "No explicit style was supplied; do not invent one.",

      occasion:
        cleanRecipientValue(
          input.occasion
        ),

      style:
        style,

      category:
        cleanRecipientValue(
          input.category
        ),

      budget:
        cleanRecipientValue(
          input.budget
        ),

      budgetCurrency:
        cleanRecipientValue(
          input.budgetCurrency
        )
    },

    catalogueDiscovery:
      catalogueDiscovery,

    agentGuidance: [

      "Use recipient information to refine jewellery recommendations rather than making the purchase decision.",

      "Treat explicit customer style preferences as a stronger aesthetic signal than recipient relationship or age.",

      "Use recipient gender as a strong catalogue-discovery signal when it is explicitly provided or reasonably inferred.",

      "Do not use recipient gender as a blanket exclusion rule.",

      "Some jewellery collections and products may apply to multiple genders, including faith-related jewellery, watches, symbolic jewellery, personalized jewellery, and other products identified by current Shopify data.",

      "Use actual current product and collection metadata to determine whether gender appears applicable to a particular product or collection.",

      "Never assume that every product for a female recipient must be female-specific.",

      "Never assume that every product for a male recipient must be male-specific.",

      "Never assume gender from ambiguous relationships such as partner, friend, colleague, or family member.",

      "When gender is inferred from an unambiguous relationship, mark it as inferred rather than explicit.",

      "Never invent recipient information.",

      "Never invent the recipient's age.",

      "Use age only when provided and when it is relevant to the customer's request.",

      "An exact age should not automatically become a strong recommendation constraint.",

      "If the customer gives an age range instead of an exact age, preserve the range without inventing an exact age.",

      "Do not make sensitive assumptions about taste, maturity, personality, or style based on age.",

      "Recipient information should work together with style, occasion, category, and budget.",

      "Explicit style preferences should not be overridden by generic assumptions about the recipient.",

      "Occasion remains contextual and should not be treated as mandatory unless the customer makes it important.",

      "Budget should be handled as a practical shopping constraint by the downstream budget and product-discovery workflow.",

      "Do not change the customer's shopping market.",

      "Do not determine destination eligibility.",

      "Do not determine shipping fees or shipping eligibility.",

      "Do not determine final market-specific pricing.",

      "Do not make the purchase decision."
    ],

    nextStep:
      "Pass recipient, gender, optional age, and the preserved style/context signals to the downstream catalogue and product-discovery workflow. Use actual Shopify product and collection data to determine whether recipient gender is applicable to each candidate."
  };
}


/* ============================================================
 * WEBMCP REGISTRATION
 * ============================================================
 */

try {

  if (
    typeof document !== "undefined" &&
    document.modelContext &&
    typeof document.modelContext.registerTool === "function"
  ) {

    document.modelContext.registerTool({

      name: recipientToolName,

      description:
        "Understand who the jewellery is intended for and organize recipient, gender, and optional age information. Gender is a strong recipient signal for catalogue discovery, but it is not a blanket product filter because some GodreryTone jewellery may be unisex or broadly applicable, including faith-related jewellery and watches. Preserve explicit customer style preferences as the stronger aesthetic signal. Use age only when provided and relevant. Inspect the current Shopify catalogue for recipient-related collection and product signals when available. Never invent recipient information, determine market or shipping, set final pricing, or make the purchase decision.",

      inputSchema:
        recipientSchema,

      execute:
        async function(input) {

          return JSON.stringify(
            await createRecipientResult(
              input
            )
          );

        }

    });

    console.info(
      "[GodreryTone WebMCP] Tool 4 recipient + age registered."
    );

  } else {

    console.info(
      "[GodreryTone WebMCP] WebMCP modelContext is not available for Tool 4."
    );

  }

} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Tool 4 recipient + age registration failed:",
    error
  );

}
/* =========================================================
   GODRERYTONE REGIONAL / NEIGHBOURING COUNTRY TOOL
   ========================================================= */

var regionalMarketToolName =
  "godrerytone_regional_market";


/* =========================================================
   INPUT SCHEMA
   ========================================================= */

var regionalMarketSchema = {

  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request."
    },

    shoppingCountry: {
      type: "string",
      description:
        "The country the customer is shopping from or has selected as their primary shopping country."
    },

    deliveryCountry: {
      type: "string",
      description:
        "The country where the customer wants the jewellery delivered, when known."
    },

    primaryMarketId: {
      type: "string",
      description:
        "The GodreryTone market identified as the customer's primary market, when already resolved."
    },

    requestedCollection: {
      type: "string",
      description:
        "The collection the customer is looking for, when known."
    },

    requestedCategory: {
      type: "string",
      description:
        "The jewellery category the customer is looking for, such as necklace, bracelet, earrings, ring, pendant, or anklet."
    },

    primaryMarketProductCount: {
      type: "number",
      description:
        "Number of suitable products currently found in the customer's primary market for the request or relevant collection."
    },

    customerRejectedPrimaryOptions: {
      type: "boolean",
      description:
        "Whether the customer has explicitly indicated that the suitable products presented from their primary market do not meet their needs."
    },

    regionalSearch: {
      type: "boolean",
      description:
        "Whether the customer has explicitly permitted the system to consider products from another GodreryTone market."
    },

    preferredAlternativeCountry: {
      type: "string",
      description:
        "A specific alternative or neighbouring country explicitly requested by the customer, if any."
    },

    regionalPriority: {
      type: "string",
      enum: [
        "nearest",
        "lowest_price",
        "largest_selection",
        "best_match",
        "balanced"
      ],
      description:
        "How regional alternatives should be prioritized after regional searching has been permitted."
    },

    shippingFlexibility: {
      type: "string",
      enum: [
        "current_country_only",
        "regional_delivery_ok",
        "international_delivery_ok",
        "unknown"
      ],
      description:
        "How flexible the customer is about receiving a product from another country or market."
    },

    priceSensitivity: {
      type: "string",
      enum: [
        "strict",
        "price_aware",
        "quality_first",
        "unknown"
      ],
      description:
        "How strongly price should influence regional alternatives."
    },

    customerAcceptedRegionalOption: {
      type: "boolean",
      description:
        "Whether the customer has explicitly accepted a specific product or purchasing option from another country after it was presented."
    },

    customerAcceptedRegionalShipping: {
      type: "boolean",
      description:
        "Whether the customer has explicitly accepted shipping the selected product from another country or market."
    }

  },

  required: [
    "request"
  ]
};


/* =========================================================
   HELPERS
   ========================================================= */

function cleanRegionalValue(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value === "string"
  ) {

    var cleaned =
      value.trim();

    return cleaned === ""
      ? null
      : cleaned;
  }

  return value;
}


function normalizeCountry(value) {

  var cleaned =
    cleanRegionalValue(value);

  if (!cleaned) {
    return null;
  }

  return String(cleaned)
    .trim()
    .toUpperCase();
}


/* =========================================================
   CREATE REGIONAL MARKET RESULT
   ========================================================= */

function createRegionalMarketResult(input) {

  input = input || {};

  var shoppingCountry =
    normalizeCountry(
      input.shoppingCountry
    );

  var deliveryCountry =
    normalizeCountry(
      input.deliveryCountry
    );

  var primaryMarketId =
    cleanRegionalValue(
      input.primaryMarketId
    );

  var requestedCollection =
    cleanRegionalValue(
      input.requestedCollection
    );

  var requestedCategory =
    cleanRegionalValue(
      input.requestedCategory
    );

  var primaryMarketProductCount =
    typeof input.primaryMarketProductCount === "number"
      ? input.primaryMarketProductCount
      : null;

  var customerRejectedPrimaryOptions =
    input.customerRejectedPrimaryOptions === true;

  var regionalSearchPermitted =
    input.regionalSearch === true;

  var customerAcceptedRegionalOption =
    input.customerAcceptedRegionalOption === true;

  var customerAcceptedRegionalShipping =
    input.customerAcceptedRegionalShipping === true;

  var regionalPriority =
    cleanRegionalValue(
      input.regionalPriority
    ) || "balanced";

  var shippingFlexibility =
    cleanRegionalValue(
      input.shippingFlexibility
    ) || "unknown";

  var priceSensitivity =
    cleanRegionalValue(
      input.priceSensitivity
    ) || "unknown";


  /* =======================================================
     PRIMARY MARKET STATE
     ======================================================= */

  var primaryMarketHasProducts =
    primaryMarketProductCount !== null &&
    primaryMarketProductCount > 0;

  var primaryMarketHasNoProducts =
    primaryMarketProductCount !== null &&
    primaryMarketProductCount === 0;


  /*
   * Regional fallback becomes relevant when:
   *
   * 1. The primary market has no suitable products, OR
   * 2. The customer has rejected the primary-market options.
   *
   * But relevance does NOT equal permission.
   */
  var regionalFallbackRelevant =
    primaryMarketHasNoProducts ||
    customerRejectedPrimaryOptions;


  /*
   * Regional search may only proceed when the customer
   * has permitted it.
   */
  var regionalSearchAllowed =
    regionalFallbackRelevant &&
    regionalSearchPermitted;


  /*
   * A specific regional purchasing option is only
   * accepted after explicit customer confirmation.
   */
  var regionalOptionAccepted =
    customerAcceptedRegionalOption === true;


  /*
   * Shipping from another country requires its own
   * explicit acceptance when applicable.
   */
  var regionalShippingAccepted =
    customerAcceptedRegionalShipping === true;


  return {

    success: true,

    brand: "GodreryTone",

    tool:
      regionalMarketToolName,


    /* =====================================================
       CUSTOMER REGIONAL INTENT
       ===================================================== */

    regionalMarketIntent: {

      request:
        cleanRegionalValue(
          input.request
        ),

      shoppingCountry:
        shoppingCountry,

      deliveryCountry:
        deliveryCountry,

      primaryMarketId:
        primaryMarketId,

      requestedCollection:
        requestedCollection,

      requestedCategory:
        requestedCategory,

      regionalSearch:
        regionalSearchPermitted,

      preferredAlternativeCountry:
        normalizeCountry(
          input.preferredAlternativeCountry
        ),

      regionalPriority:
        regionalPriority,

      shippingFlexibility:
        shippingFlexibility,

      priceSensitivity:
        priceSensitivity,

      customerRejectedPrimaryOptions:
        customerRejectedPrimaryOptions,

      customerAcceptedRegionalOption:
        regionalOptionAccepted,

      customerAcceptedRegionalShipping:
        regionalShippingAccepted
    },


    /* =====================================================
       PRIMARY MARKET RESULT
       ===================================================== */

    primaryMarketResolution: {

      primaryMarket:
        primaryMarketId,

      shoppingCountry:
        shoppingCountry,

      deliveryCountry:
        deliveryCountry,

      productCount:
        primaryMarketProductCount,

      productsAvailable:
        primaryMarketHasProducts,

      noSuitableProducts:
        primaryMarketHasNoProducts,

      customerRejectedAvailableProducts:
        customerRejectedPrimaryOptions,

      primaryMarketMustBeSearchedFirst:
        true,

      primaryMarketProductsMustBeDisplayedFirst:
        true,

      regionalProductsMustNotReplacePrimaryMarketProducts:
        true
    },


    /* =====================================================
       REGIONAL FALLBACK STATE
       ===================================================== */

    regionalFallback: {

      relevant:
        regionalFallbackRelevant,

      permissionRequired:
        true,

      permissionGranted:
        regionalSearchPermitted,

      searchAllowed:
        regionalSearchAllowed,

      customerAcceptanceRequired:
        true,

      customerAcceptanceReceived:
        regionalOptionAccepted,

      regionalShippingAcceptanceReceived:
        regionalShippingAccepted,

      reason:
        primaryMarketHasNoProducts
          ? "No suitable products were found in the customer's primary market."
          : customerRejectedPrimaryOptions
            ? "The customer rejected the available primary-market options."
            : "The customer's primary-market search has not yet failed or been rejected."
    },


    /* =====================================================
       REGIONAL MARKET RULES
       ===================================================== */

    regionalMarketRules: {

      customerMarketIsPrimary:
        true,

      resolveCustomerMarketBeforeRegionalSearch:
        true,

      searchPrimaryMarketFirst:
        true,

      displayPrimaryMarketProductsFirst:
        true,

      regionalSearchIsFallback:
        true,

      regionalSearchRequiresCustomerPermission:
        true,

      regionalSearchDoesNotEqualRegionalPurchaseAcceptance:
        true,

      specificRegionalOptionRequiresCustomerAcceptance:
        true,

      regionalShippingRequiresConfirmationWhenDifferent:
        true,

      neverSilentlySwitchMarket:
        true,

      neverSilentlyChangeDeliveryCountry:
        true,

      neverAssumeSameProductPriceAcrossMarkets:
        true,

      neverApplyRegionalPriceToPrimaryMarket:
        true,

      compareActualMarketSpecificPrices:
        true,

      verifyProductDestinationEligibility:
        true,

      verifyShippingTime:
        true,

      verifyShippingCost:
        true,

      verifyFreeShippingStatus:
        true,

      useMarketSpecificShippingInstructions:
        true,

      doNotInventShippingInformation:
        true,

      doNotInventProductAvailability:
        true,

      doNotInventMarketPrices:
        true,

      customerMakesFinalRegionalDecision:
        true
    },


    /* =====================================================
       SHIPPING RESOLUTION RULES
       ===================================================== */

    shippingResolutionRules: {

      shippingMustBeResolvedForActualProductMarket:
        true,

      shippingMustBeResolvedForActualDeliveryCountry:
        true,

      shippingTimeMustFollowGodreryToneMarketInstructions:
        true,

      shippingCostMustFollowGodreryToneMarketInstructions:
        true,

      freeShippingMustBeExplicitlyEstablished:
        true,

      productMustBeEligibleForDestination:
        true,

      regionalProductMustNotBePresentedAsDeliverable
        : true,

      shippingInformationMustBeShownBeforeRegionalAcceptance:
        true,

      differentShippingConditionsMustBeDisclosed:
        true,

      differentDeliveryTimeMustBeDisclosed:
        true,

      differentShippingCostMustBeDisclosed:
        true
    },


    /* =====================================================
       MARKET PRICE RULES
       ===================================================== */

    priceRules: {

      priceBelongsToMarket:
        true,

      sameProductMayHaveDifferentMarketPrice:
        true,

      neverAssumePriceEquality:
        true,

      neverTransferRegionalPriceToPrimaryMarket:
        true,

      reportRegionalPriceSeparately:
        true,

      useActualCataloguePrice:
        true,

      budgetConversionHandledByBudgetTool:
        true
    },


    /* =====================================================
       COMMERCE DATA RESPONSIBILITIES
       ===================================================== */

    commerceDataResponsibilities: {

      bit1:
        "Use Bit 1 for stable vendor, market, region, product, and relationship rules.",

      bit1b:
        "Use Bit 1B for current dynamic commerce data, market data, product data, and destination/shipping resolution.",

      catalogue:
        "Use the Product/Catalogue tool to query products belonging to the customer's primary market first and to retrieve regional alternatives only after regional searching is permitted.",

      regionalTool:
        "Use this tool to enforce primary-market-first logic, determine when regional fallback is relevant, establish permission requirements, and govern customer acceptance of another market.",

      budgetTool:
        "Use the Budget/Currency tool to normalize the customer's budget and perform USD backend matching. Do not perform currency conversion in this tool."
    },


    /* =====================================================
       AGENT GUIDANCE
       ===================================================== */

    agentGuidance: [

      "Resolve the customer's shopping country before searching regional alternatives.",

      "Treat the customer's shopping country as the primary market.",

      "Query the primary market's catalogue first.",

      "Only display products belonging to the customer's primary market during the initial product search.",

      "Do not mix products from other countries into the initial primary-market results.",

      "If suitable products exist in the primary market, present those products first.",

      "If the customer chooses one of the primary-market products, continue with that market.",

      "If the customer rejects the primary-market products, regional alternatives may subsequently be considered.",

      "If the relevant collection or category contains zero suitable products in the customer's primary market, regional fallback may be offered.",

      "A collection having zero products in one country does not mean that the collection has zero products globally.",

      "When the primary market has no suitable products, explain that the requested product or collection is not currently available through the customer's primary market before offering regional alternatives.",

      "Do not automatically search another country merely because a product exists there.",

      "Do not automatically move the customer to another market.",

      "Regional search requires explicit customer permission.",

      "If regional search has not been permitted, remain within the customer's primary market.",

      "If regional search is permitted, identify eligible neighbouring or related GodreryTone markets that contain relevant products.",

      "Prioritize regional alternatives according to the customer's stated regional preference.",

      "A regional alternative may be the same product, a related product, a different product, or no suitable product.",

      "Do not assume that the same product has the same price in another country.",

      "The price retrieved from another market belongs to that market.",

      "Clearly disclose when a regional product has a different market-specific price.",

      "Do not imply that the regional price automatically applies to the customer's primary market.",

      "Before presenting a regional product as a viable option, determine whether the product's market can ship it to the customer's intended delivery country.",

      "Use the actual shipping rules applicable to the market supplying the product.",

      "Determine the applicable delivery time according to GodreryTone shipping instructions for that market and destination.",

      "Determine whether shipping is free or charged according to the applicable market shipping rules.",

      "Do not invent delivery times.",

      "Do not invent shipping fees.",

      "Do not claim free shipping unless the applicable commerce data establishes it.",

      "If the regional market cannot ship the product to the customer's delivery country, do not present that product as directly purchasable for that destination.",

      "If the product can be shipped from the regional market to the customer's destination, clearly explain the market, price, shipping cost, and expected delivery time.",

      "If shipping from another country creates a different delivery arrangement, disclose that difference clearly.",

      "Ask the customer whether they agree to proceed with the regional-market option when the product would be supplied from another country.",

      "Do not treat permission to search regionally as acceptance of a specific regional product.",

      "Do not treat discovery of a regional product as customer acceptance.",

      "If the customer declines the regional option, return to the customer's primary market.",

      "If the customer accepts a regional option, continue using that market's actual product price and shipping rules.",

      "If the customer changes the delivery country, re-evaluate destination eligibility and shipping conditions.",

      "Do not perform final currency conversion in this tool.",

      "Do not perform final product selection in this tool."
    ],


    /* =====================================================
       REGIONAL INTERACTION EXAMPLES
       ===================================================== */

    regionalInteractionExamples: [

      "If Kenya has suitable anniversary necklaces, show the Kenya-market necklaces first and do not mix Uganda products into those results.",

      "If the Kenya anniversary collection has zero suitable products, explain that there are currently no suitable products available through the Kenya market and offer to check related products in neighbouring markets if the customer permits it.",

      "If Kenya has products but the customer says none of them are suitable, the system may offer regional exploration.",

      "If the customer has not permitted regional searching, do not search Uganda, Tanzania, or another market.",

      "If the customer permits regional searching and Uganda has a related product, present Uganda as a regional option rather than silently switching the customer to Uganda.",

      "If the same necklace exists in Kenya and Uganda at different prices, report each price according to its respective market.",

      "If Uganda can ship the product to Kenya, verify and disclose the applicable Uganda-to-Kenya delivery time and shipping cost.",

      "If Uganda offers free shipping to Kenya under its applicable shipping rules, explicitly state that shipping is free rather than assuming it.",

      "If Uganda cannot ship the product to Kenya, do not present it as a directly deliverable option for the Kenyan customer.",

      "If the customer agrees to purchase the Uganda-market product and accepts its shipping arrangement, continue using Uganda's actual market-specific price and shipping conditions.",

      "If the customer says they can receive the product in Uganda instead, treat Uganda as the delivery destination and re-evaluate shipping eligibility and delivery conditions.",

      "If the customer declines the regional option, continue the search within the primary market."
    ],


    /* =====================================================
       DECISION STATES
       ===================================================== */

    decisionStates: {

      primaryMarketRequired:
        "The customer's primary market must be queried before regional alternatives.",

      primaryProductsAvailable:
        "Suitable products exist in the customer's primary market and should be presented first.",

      primaryMarketEmpty:
        "No suitable products were found in the relevant collection or category within the customer's primary market.",

      primaryOptionsRejected:
        "The customer has rejected the products presented from the primary market.",

      regionalPermissionRequired:
        "Regional alternatives may be relevant, but the customer has not yet permitted regional searching.",

      regionalSearchPermitted:
        "The customer has permitted investigation of other GodreryTone markets.",

      regionalOptionsFound:
        "Relevant products have been found in one or more permitted regional markets.",

      regionalShippingPending:
        "The regional product has been found but its destination eligibility, delivery time, or shipping cost must still be resolved.",

      regionalOptionReadyForCustomer:
        "The regional product's market, price, destination eligibility, delivery time, and shipping conditions have been resolved and can be presented to the customer.",

      regionalOptionAccepted:
        "The customer has explicitly accepted the regional-market option.",

      regionalOptionDeclined:
        "The customer has declined the regional option and the system should return to the primary market."
    },


    /* =====================================================
       NEXT STEP
       ===================================================== */

    nextStep:

      primaryMarketHasProducts &&
      !customerRejectedPrimaryOptions

        ? "Present only suitable products from the customer's primary market. Do not introduce products from another country unless the customer later rejects the available options or requests regional alternatives."

        : primaryMarketHasNoProducts &&
          !regionalSearchPermitted

          ? "Inform the customer that no suitable product is currently available in the relevant collection or category through the primary market. Offer the customer the option to explore related products in neighbouring or other eligible GodreryTone markets."

          : customerRejectedPrimaryOptions &&
            !regionalSearchPermitted

            ? "The customer has rejected the primary-market options. Ask whether they would like to explore related products available through neighbouring or other eligible GodreryTone markets."

            : regionalSearchAllowed &&
              !regionalOptionAccepted

              ? "Search permitted regional markets for related products. For every candidate, resolve its actual market-specific price and whether that market can ship the product to the customer's delivery country, including applicable delivery time and shipping cost. Present the regional option to the customer and obtain explicit acceptance before proceeding."

              : regionalOptionAccepted

                ? "Proceed using the accepted regional market's actual product price and shipping conditions. Do not substitute the regional price or shipping rules into the customer's original primary market."

                : "Keep the customer's primary market as the active market and do not silently switch markets."
  };
}


/* =========================================================
   REGISTER TOOL
   ========================================================= */

try {

  document.modelContext.registerTool({

    name:
      regionalMarketToolName,

    description:
      "Manage GodreryTone primary-market and regional-market shopping. First ensure that products are queried and displayed from the customer's selected country/market only. If the relevant collection or category has no suitable products, or the customer rejects the available primary-market products, the tool can offer regional exploration. Regional searching requires customer permission. When a product is found in another market, resolve that market's actual product price, destination eligibility, shipping time, and shipping cost/free-shipping status before presenting it. Never silently switch markets, never apply one market's price or shipping conditions to another market, and require customer acceptance before proceeding with a product supplied from another country.",

    inputSchema:
      regionalMarketSchema,

    execute:
      async function (input) {

        return JSON.stringify(
          createRegionalMarketResult(input)
        );

      }

  });

  console.info(
    "[GodreryTone WebMCP] regional market tool registered successfully."
  );

} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Regional market tool registration failed:",
    error
  );

}

  /* =========================================================
   GODRERYTONE BUDGET TOOL
   ========================================================= */

var budgetToolName = "godrerytone_budget";


var budgetSchema = {
  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request."
    },

    budget: {
      type: "number",
      description:
        "The customer's stated budget amount in the currency provided by the customer or established from their shopping-country context. Never invent a budget."
    },

    budgetType: {
      type: "string",
      enum: [
        "maximum",
        "target",
        "flexible",
        "unknown"
      ],
      description:
        "Whether the customer gave a strict maximum, preferred target, flexible amount, or no clear budget."
    },

    budgetCurrency: {
      type: "string",
      description:
        "The customer's budget currency, preferably established from the customer's explicit currency or verified shopping-country currency."
    },

    budgetMin: {
      type: "number",
      description:
        "The lower end of a stated budget range in the customer's budget currency, when applicable."
    },

    budgetMax: {
      type: "number",
      description:
        "The upper end of a stated budget range in the customer's budget currency, when applicable."
    },

    normalizedBudgetUSD: {
      type: "number",
      description:
        "The customer's budget normalized into USD by GodreryTone's verified FX infrastructure. This value must come from a current verified exchange rate and must never be invented or hardcoded."
    },

    normalizedBudgetMinUSD: {
      type: "number",
      description:
        "The lower end of the customer's budget range normalized into USD using GodreryTone's verified FX infrastructure."
    },

    normalizedBudgetMaxUSD: {
      type: "number",
      description:
        "The upper end of the customer's budget range normalized into USD using GodreryTone's verified FX infrastructure."
    },

    exchangeRateUsed: {
      type: "number",
      description:
        "The verified current exchange rate used by GodreryTone's FX infrastructure to normalize the customer's currency into USD."
    },

    exchangeRateTimestamp: {
      type: "string",
      description:
        "The timestamp associated with the verified exchange rate used for budget normalization."
    },

    priceSensitivity: {
      type: "string",
      enum: [
        "strict",
        "price_aware",
        "quality_first",
        "unknown"
      ],
      description:
        "How strongly price should influence the recommendation."
    },

    budgetCertainty: {
      type: "string",
      enum: [
        "explicit",
        "inferred",
        "unknown"
      ],
      description:
        "Whether the budget was explicitly stated, reasonably inferred, or unavailable."
    },

    crossMarketPricePreference: {
      type: "string",
      enum: [
        "not_requested",
        "open_to_suggestion",
        "explicitly_open",
        "not_permitted",
        "unknown"
      ],
      description:
        "Whether the customer has expressed willingness to consider a suitable product from another GodreryTone market if the current market does not satisfy the request. This does not authorize a market switch and does not determine the nearest country, shipping, or collection."
    }
  },

  required: [
    "request"
  ]
};


/* =========================================================
   FX NORMALIZATION HELPER
   ========================================================= */

async function normalizeBudgetToUSD(
  amount,
  currency
) {

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {

    return {
      status: "unknown",
      reason:
        "Invalid budget amount."
    };
  }


  if (
    typeof currency !== "string" ||
    !currency.trim()
  ) {

    return {
      status: "unknown",
      reason:
        "Budget currency is required before currency normalization."
    };
  }


  /*
   * IMPORTANT:
   *
   * FX conversion is deliberately delegated to Bit 1B's
   * shared currency infrastructure.
   *
   * Budget does NOT contain its own exchange-rate logic.
   *
   * It does NOT hardcode or invent exchange rates.
   */

  if (
    !GT.currency ||
    typeof GT.currency.toUSD !== "function"
  ) {

    return {
      status: "unknown",
      reason:
        "GodreryTone FX infrastructure is not available."
    };
  }


  var result =
    await GT.currency.toUSD(
      amount,
      currency
    );


  if (
    !result ||
    result.status !== "ok" ||
    !result.data
  ) {

    return {
      status: "unknown",
      reason:
        result && result.reason
          ? result.reason
          : "Current verified exchange rate is unavailable."
    };
  }


  if (
    result.data.verified !== true
  ) {

    return {
      status: "unknown",
      reason:
        "Budget normalization requires a verified exchange rate."
    };
  }


  return {
    status: "ok",
    data: result.data
  };
}


/* =========================================================
   BUDGET RESULT
   ========================================================= */

async function createBudgetResult(input) {

  input = input || {};


  var hasBudget =
    input.budget !== undefined &&
    input.budget !== null &&
    input.budget !== "";


  var hasMin =
    input.budgetMin !== undefined &&
    input.budgetMin !== null &&
    input.budgetMin !== "";


  var hasMax =
    input.budgetMax !== undefined &&
    input.budgetMax !== null &&
    input.budgetMax !== "";


  var budgetProvided =
    hasBudget ||
    hasMin ||
    hasMax;


  var budgetCertainty =
    input.budgetCertainty ||
    (budgetProvided
      ? "explicit"
      : "unknown");


  var crossMarketPricePreference =
    input.crossMarketPricePreference ||
    "not_requested";


  /*
   * ---------------------------------------------------------
   * Currency normalization state
   * ---------------------------------------------------------
   */

  var normalizedBudgetUSD = null;

  var normalizedBudgetMinUSD = null;

  var normalizedBudgetMaxUSD = null;

  var exchangeRateUsed = null;

  var exchangeRateTimestamp = null;

  var exchangeRateSource = null;

  var normalizationStatus =
    !budgetProvided
      ? "not_required"
      : "pending";


  var normalizationReason = null;


  /*
   * ---------------------------------------------------------
   * Normalize the customer's actual budget through the
   * shared FX infrastructure.
   *
   * We deliberately do NOT trust a caller-provided
   * normalizedBudgetUSD value when actual conversion can
   * be performed.
   * ---------------------------------------------------------
   */

  if (budgetProvided) {

    var currency =
      typeof input.budgetCurrency === "string"
        ? input.budgetCurrency.trim().toUpperCase()
        : null;


    if (!currency) {

      normalizationStatus =
        "pending";

      normalizationReason =
        "Budget currency is required before USD normalization.";

    } else {

      var normalizationSucceeded =
        true;


      /*
       * Single budget amount.
       */

      if (hasBudget) {

        var budgetUSDResult =
          await normalizeBudgetToUSD(
            input.budget,
            currency
          );


        if (
          budgetUSDResult.status !== "ok"
        ) {

          normalizationSucceeded =
            false;

          normalizationReason =
            budgetUSDResult.reason;

        } else {

          normalizedBudgetUSD =
            budgetUSDResult.data.convertedAmount;

          exchangeRateUsed =
            budgetUSDResult.data.exchangeRateUsed;

          exchangeRateTimestamp =
            budgetUSDResult.data.exchangeRateTimestamp;

          exchangeRateSource =
            budgetUSDResult.data.exchangeRateSource;
        }
      }


      /*
       * Budget minimum.
       *
       * This is independently converted so a budget range
       * can be normalized correctly.
       */

      if (hasMin) {

        var minUSDResult =
          await normalizeBudgetToUSD(
            input.budgetMin,
            currency
          );


        if (
          minUSDResult.status !== "ok"
        ) {

          normalizationSucceeded =
            false;

          normalizationReason =
            minUSDResult.reason;

        } else {

          normalizedBudgetMinUSD =
            minUSDResult.data.convertedAmount;


          /*
           * If no exchange-rate metadata has yet been
           * captured, use the verified metadata from this
           * conversion.
           */

          if (
            exchangeRateUsed === null
          ) {

            exchangeRateUsed =
              minUSDResult.data.exchangeRateUsed;

            exchangeRateTimestamp =
              minUSDResult.data.exchangeRateTimestamp;

            exchangeRateSource =
              minUSDResult.data.exchangeRateSource;
          }
        }
      }


      /*
       * Budget maximum.
       */

      if (hasMax) {

        var maxUSDResult =
          await normalizeBudgetToUSD(
            input.budgetMax,
            currency
          );


        if (
          maxUSDResult.status !== "ok"
        ) {

          normalizationSucceeded =
            false;

          normalizationReason =
            maxUSDResult.reason;

        } else {

          normalizedBudgetMaxUSD =
            maxUSDResult.data.convertedAmount;


          /*
           * If no exchange-rate metadata has yet been
           * captured, use the verified metadata from this
           * conversion.
           */

          if (
            exchangeRateUsed === null
          ) {

            exchangeRateUsed =
              maxUSDResult.data.exchangeRateUsed;

            exchangeRateTimestamp =
              maxUSDResult.data.exchangeRateTimestamp;

            exchangeRateSource =
              maxUSDResult.data.exchangeRateSource;
          }
        }
      }


      /*
       * A budget is considered normalized only when every
       * supplied monetary component has been successfully
       * normalized.
       */

      if (normalizationSucceeded) {

        normalizationStatus =
          "normalized";

      } else {

        normalizationStatus =
          "pending";
      }
    }
  }


  return {

    success: true,

    brand: "GodreryTone",


    budgetIntent: {

      request:
        input.request || null,

      budget:
        hasBudget
          ? input.budget
          : null,

      budgetType:
        input.budgetType || "unknown",

      budgetCurrency:
        input.budgetCurrency || null,

      budgetMin:
        hasMin
          ? input.budgetMin
          : null,

      budgetMax:
        hasMax
          ? input.budgetMax
          : null,

      budgetProvided:
        budgetProvided,

      budgetCertainty:
        budgetCertainty,

      priceSensitivity:
        input.priceSensitivity || "unknown",

      crossMarketPricePreference:
        crossMarketPricePreference
    },


    currencyNormalization: {

      storeBaseCurrency:
        "USD",

      customerBudgetCurrency:
        input.budgetCurrency || null,

      normalizedBudgetUSD:
        normalizedBudgetUSD,

      normalizedBudgetMinUSD:
        normalizedBudgetMinUSD,

      normalizedBudgetMaxUSD:
        normalizedBudgetMaxUSD,

      exchangeRateUsed:
        exchangeRateUsed,

      exchangeRateTimestamp:
        exchangeRateTimestamp,

      exchangeRateSource:
        exchangeRateSource,

      exchangeRateVerified:
        exchangeRateUsed !== null,

      normalizationStatus:
        normalizationStatus,

      normalizationReason:
        normalizationReason,

      purpose:
        "Normalize the customer's local-currency budget into USD using GodreryTone's current verified FX infrastructure so it can be compared consistently against GodreryTone's USD-based Shopify product prices."
    },


    currencyConversionRules: {

      storeBaseCurrency:
        "USD",

      normalizeCustomerBudgetToUSD:
        true,

      normalizeBudgetUsingSharedFXInfrastructure:
        true,

      compareProductPricesUsingUSD:
        true,

      convertProductPricesBackToCustomerCurrencyForDisplay:
        true,

      useCurrentExchangeRate:
        true,

      requireVerifiedExchangeRate:
        true,

      neverHardcodeExchangeRates:
        true,

      neverInventExchangeRates:
        true,

      preserveOriginalCustomerCurrency:
        true,

      preserveOriginalUSDProductPrice:
        true,

      clearlyLabelConvertedPrices:
        true,

      convertedDisplayPriceIsNotAutomaticallyCheckoutPrice:
        true,

      currencyConversionDoesNotChangeMarket:
        true,

      currencyConversionDoesNotChangeShippingEligibility:
        true
    },


    marketPricingRules: {

      respectCustomerBudget:
        true,

      compareProductsAgainstNormalizedUSDBudget:
        true,

      comparePricesWithinSelectedMarket:
        true,

      comparePricesAcrossMarketsOnlyWhenCustomerHasExpressedOpenness:
        true,

      neverAssumeSamePriceAcrossMarkets:
        true,

      neverApplyAnotherMarketPriceAutomatically:
        true,

      neverSilentlySwitchMarket:
        true,

      neverPresentAnotherMarketPriceAsCurrentMarketPrice:
        true,

      explainRegionalPriceDifference:
        true,

      requireSeparateMarketVerification:
        true,

      requireFulfillmentVerificationBeforeCrossMarketRecommendation:
        true
    },


    agentGuidance: [

      "Let the customer state their budget naturally.",

      "Do not ask for a budget if the customer has not indicated that budget matters and the conversation can proceed without it.",

      "Never invent or assume a customer's budget.",

      "Do not treat the absence of a budget as a zero budget.",

      "If the customer gives a maximum budget, treat it as a spending limit unless the customer changes it.",

      "If the customer gives a target budget, use it as a preferred price point rather than an absolute restriction.",

      "If the customer describes a flexible budget, prioritize suitable jewellery while remaining mindful of value.",

      "If the customer gives a budget range, preserve the range and search within it where possible.",

      "If the customer explicitly says price is not important, prioritize suitability, quality, style, and other stated preferences.",

      "Do not reject a suitable product merely because it is slightly above a target budget unless the customer clearly stated that the amount is a strict maximum.",

      "Respect the currency explicitly stated by the customer.",

      "If the customer does not explicitly state a currency, use verified shopping-country currency information when available rather than inventing a currency.",

      "When a budget and its currency are available, normalize the customer's budget into USD by calling GodreryTone's shared FX infrastructure.",

      "Do not perform independent currency mathematics inside the Budget tool.",

      "Do not hardcode exchange rates.",

      "Do not invent exchange rates.",

      "Require a current verified exchange rate before treating a local-currency budget as normalized USD.",

      "If a verified exchange rate cannot be obtained, keep normalizationStatus as pending and do not invent a normalized USD budget.",

      "Preserve the customer's original budget amount and original currency even after USD normalization.",

      "When product prices are presented to the customer, convert the verified USD product price back into the customer's preferred or relevant currency when appropriate.",

      "Clearly identify converted currency amounts as converted or approximate when the conversion is not the actual Shopify checkout currency.",

      "Currency conversion is for consistent comparison and customer-friendly presentation; it does not change the underlying Shopify product price.",

      "A converted local-currency amount must not be presented as though Shopify has changed the product's underlying USD price.",

      "The customer's current shopping market should be considered before cross-market alternatives.",

      "Do not introduce another market merely because its price is lower.",

      "A cross-market alternative should normally be considered only when the customer's stated preferences cannot be satisfactorily fulfilled in the current market.",

      "If the customer has not expressed openness to another market, do not assume that they want cross-market alternatives.",

      "If the customer is open to another market, later market-routing and shipping tools must determine whether an alternative is actually viable.",

      "Do not determine the nearest country or nearest market from the budget tool.",

      "Do not claim that a customer can collect a product from another country unless the relevant fulfilment or collection capability has been verified.",

      "Do not silently move the customer to another market merely because another market has a lower price.",

      "The customer makes the final purchasing decision."
    ],


    nextStep:
      "Use the customer's normalized USD budget together with category, style, occasion, recipient, applicable age information, shopping country, current catalogue availability, market routing, product availability, market-specific pricing, and verified shipping or collection eligibility to find suitable GodreryTone jewellery. Convert verified USD product prices back into the customer's preferred currency for customer-facing presentation when appropriate."
  };
}


/* =========================================================
   REGISTER BUDGET TOOL
   ========================================================= */

try {

  document.modelContext.registerTool({

    name: budgetToolName,

    description:
      "Understand a customer's jewellery budget in their stated or verified local currency, explicitly call GodreryTone's shared FX infrastructure to normalize that budget into USD for comparison with GodreryTone's USD-based Shopify product prices, and support conversion of verified USD product prices back into the customer's preferred currency for presentation. Never invent exchange rates, silently switch markets, or treat converted display prices as a change to the underlying Shopify price.",

    inputSchema:
      budgetSchema,

    execute:
      async function (input) {

        return JSON.stringify(
          await createBudgetResult(input)
        );

      }

  });


  console.info(
    "[GodreryTone WebMCP] budget tool registered successfully."
  );


} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Budget tool registration failed:",
    error
  );

}
    /* =========================================================
   GODRERYTONE PRODUCT / CATALOGUE TOOL
   ========================================================= */

var productCatalogueToolName =
  "godrerytone_product_catalogue";

var productCatalogueSchema = {
  type: "object",

  properties: {

    request: {
      type: "string",
      description:
        "The customer's complete natural-language jewellery shopping request."
    },

    shoppingCountry: {
      type: "string",
      description:
        "The country or market the customer wants to shop from."
    },

    deliveryCountry: {
      type: "string",
      description:
        "The country where the jewellery will be delivered, if known."
    },

    category: {
      type: "string",
      description:
        "Jewellery category such as necklace, earrings, bracelet, ring, pendant, anklet, brooch, or general jewellery."
    },

    style: {
      type: "string",
      description:
        "Preferred jewellery style such as elegant, minimalist, classic, romantic, bold, luxury, casual, traditional, modern, vintage, or statement."
    },

    occasion: {
      type: "string",
      description:
        "The occasion for the jewellery, when provided."
    },

    recipient: {
      type: "string",
      description:
        "The intended recipient of the jewellery, when provided."
    },

    recipientAge: {
      type: "number",
      description:
        "The recipient's exact age when provided and relevant."
    },

    recipientAgeRange: {
      type: "string",
      description:
        "The recipient's approximate age range when provided."
    },

    budget: {
      type: "number",
      description:
        "The customer's target or maximum product budget when provided."
    },

    budgetType: {
      type: "string",
      enum: [
        "maximum",
        "target",
        "flexible",
        "unknown"
      ],
      description:
        "Whether the budget is a maximum, target, flexible, or unknown."
    },

    budgetCurrency: {
      type: "string",
      description:
        "The currency explicitly stated by the customer, if provided."
    },

    /*
     * Supplied by Budget / Currency after normalization.
     *
     * Product/Catalogue consumes this value only.
     * It does not calculate or derive the USD amount.
     */

    budgetUSD: {
      type: "number",
      description:
        "The customer's budget converted into USD by the Budget / Currency tool."
    },

    customerCurrency: {
      type: "string",
      description:
        "The customer's preferred presentation currency. Product/Catalogue records this context but does not perform currency conversion."
    },

    regionalSearch: {
      type: "boolean",
      description:
        "Whether the customer permits products from other GodreryTone markets to be considered."
    },

    regionalPriority: {
      type: "string",
      enum: [
        "nearest",
        "lowest_price",
        "largest_selection",
        "best_match",
        "balanced"
      ],
      description:
        "The customer's preferred priority when regional alternatives are permitted."
    },

    shippingFlexibility: {
      type: "string",
      enum: [
        "current_country_only",
        "regional_delivery_ok",
        "international_delivery_ok",
        "unknown"
      ],
      description:
        "How flexible the customer is about receiving an item from another market."
    },

    priceSensitivity: {
      type: "string",
      enum: [
        "strict",
        "price_aware",
        "quality_first",
        "unknown"
      ],
      description:
        "How strongly price should influence product selection."
    },

    maxResults: {
      type: "number",
      description:
        "Maximum number of product candidates to return."
    }
  },

  required: [
    "request"
  ]
};


/* =========================================================
   BASIC CLEANING
   ========================================================= */

function cleanCatalogueValue(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return value;
}


function cleanCatalogueString(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}


function normalizeCatalogueValue(value) {

  return cleanCatalogueString(value)
    .toLowerCase();
}


function catalogueNumber(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  var number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}


function catalogueArray(value) {

  if (Array.isArray(value)) {

    return value
      .map(function (item) {
        return cleanCatalogueString(item);
      })
      .filter(Boolean);

  }

  if (typeof value === "string") {

    return value
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  return [];
}


function catalogueValueMatches(
  productValue,
  requestedValue
) {

  var productText =
    normalizeCatalogueValue(
      productValue
    );

  var requestedText =
    normalizeCatalogueValue(
      requestedValue
    );

  if (
    !productText ||
    !requestedText
  ) {
    return false;
  }

  return (
    productText === requestedText ||
    productText.indexOf(requestedText) !== -1 ||
    requestedText.indexOf(productText) !== -1
  );
}


function catalogueArrayMatches(
  productValue,
  requestedValue
) {

  var values =
    catalogueArray(productValue);

  return values.some(function (value) {

    return catalogueValueMatches(
      value,
      requestedValue
    );

  });
}


/* =========================================================
   PRODUCT SEARCH TEXT
   ========================================================= */

function buildCatalogueProductText(
  product
) {

  return [

    product.title,
    product.name,
    product.description,
    product.productType,
    product.category,
    product.collection,
    product.style,
    product.occasion,
    product.recipient,
    product.age,
    product.ageRange

  ]
    .map(function (value) {
      return cleanCatalogueString(value);
    })
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


/* =========================================================
   PRODUCT NORMALIZATION
   ========================================================= */

function normalizeCatalogueProduct(
  product
) {

  if (
    !product ||
    typeof product !== "object"
  ) {
    return null;
  }

  return {

    /*
     * Customer-safe product information.
     */

    productId:
      product.productId ||
      product.id ||
      "",

    variantId:
      product.variantId ||
      "",

    title:
      product.title ||
      product.name ||
      "",

    handle:
      product.handle ||
      "",

    url:
      product.url ||
      product.productUrl ||
      "",

    image:
      product.image ||
      product.imageUrl ||
      "",

    description:
      product.description ||
      "",

    productType:
      product.productType ||
      "",

    category:
      product.category ||
      "",

    collection:
      product.collection ||
      "",

    style:
      product.style ||
      product.styles ||
      "",

    occasion:
      product.occasion ||
      product.occasions ||
      "",

    recipient:
      product.recipient ||
      "",

    age:
      product.age ||
      "",

    ageRange:
      product.ageRange ||
      "",

    availability:
      product.availability !== undefined
        ? product.availability
        : null,

    /*
     * Catalogue price is internally treated as USD because
     * the store catalogue is fixed in USD.
     *
     * Product/Catalogue does not convert this value.
     */

    priceUSD:
      catalogueNumber(
        product.priceUSD !== undefined
          ? product.priceUSD
          : product.price
      ),

    /*
     * Internal commerce information.
     *
     * These fields are intentionally never returned in the
     * customer-facing product object.
     */

    marketId:
      product.marketId ||
      "",

    catalogueId:
      product.catalogueId ||
      "",

    vendorId:
      product.vendorId ||
      "",

    vendor:
      product.vendor ||
      "",

    supplierId:
      product.supplierId ||
      "",

    supplier:
      product.supplier ||
      "",

    brand:
      product.brand ||
      ""
  };
}


/* =========================================================
   PRIMARY MARKET PRODUCT RETRIEVAL
   ========================================================= */

async function getCatalogueProducts(
  input
) {

  if (
    !window.GodreryToneWebMCP ||
    !window.GodreryToneWebMCP.data ||
    typeof window.GodreryToneWebMCP.data.getProducts !==
      "function"
  ) {

    return [];

  }

  var GT =
    window.GodreryToneWebMCP;

  var primaryMarketId =
    cleanCatalogueString(
      input.primaryMarketId ||
      input.marketId
    );


  /*
   * The primary market must already have been resolved by
   * the upstream commerce/market logic.
   *
   * Product/Catalogue does not invent a market.
   */

  if (!primaryMarketId) {
    return [];
  }


  try {

    var products =
      await GT.data.getProducts({

        marketId:
          primaryMarketId,

        country:
          cleanCatalogueString(
            input.shoppingCountry
          ),

        collection:
          cleanCatalogueString(
            input.requestedCollection ||
            input.collection
          ),

        category:
          cleanCatalogueString(
            input.category
          )

      });


    if (!Array.isArray(products)) {
      return [];
    }


    return products;

  } catch (error) {

    console.warn(
      "[GodreryTone WebMCP] Catalogue product retrieval failed:",
      error
    );

    return [];
  }
}


/* =========================================================
   PRODUCT SCORING
   ========================================================= */

function scoreCatalogueProduct(
  product,
  input
) {

  var score = 0;

  var matches = [];


  /*
   * Category
   */

  if (
    cleanCatalogueString(
      input.category
    )
  ) {

    if (
      catalogueValueMatches(
        product.category,
        input.category
      ) ||
      catalogueValueMatches(
        product.productType,
        input.category
      )
    ) {

      score += 30;

      matches.push(
        "category"
      );
    }
  }


  /*
   * Style
   */

  if (
    cleanCatalogueString(
      input.style
    )
  ) {

    if (
      catalogueValueMatches(
        product.style,
        input.style
      ) ||
      catalogueArrayMatches(
        product.style,
        input.style
      )
    ) {

      score += 20;

      matches.push(
        "style"
      );
    }
  }


  /*
   * Occasion
   */

  if (
    cleanCatalogueString(
      input.occasion
    )
  ) {

    if (
      catalogueValueMatches(
        product.occasion,
        input.occasion
      ) ||
      catalogueArrayMatches(
        product.occasion,
        input.occasion
      )
    ) {

      score += 20;

      matches.push(
        "occasion"
      );
    }
  }


  /*
   * Recipient
   */

  if (
    cleanCatalogueString(
      input.recipient
    )
  ) {

    if (
      catalogueValueMatches(
        product.recipient,
        input.recipient
      )
    ) {

      score += 15;

      matches.push(
        "recipient"
      );

    } else if (
      buildCatalogueProductText(
        product
      ).indexOf(
        normalizeCatalogueValue(
          input.recipient
        )
      ) !== -1
    ) {

      score += 10;

      matches.push(
        "recipient"
      );
    }
  }


  /*
   * Recipient age
   */

  if (
    input.recipientAge !==
      undefined &&
    input.recipientAge !==
      null
  ) {

    if (
      catalogueValueMatches(
        product.age,
        input.recipientAge
      ) ||
      catalogueValueMatches(
        product.ageRange,
        input.recipientAge
      )
    ) {

      score += 10;

      matches.push(
        "age"
      );
    }
  }


  /*
   * Recipient age range
   */

  if (
    cleanCatalogueString(
      input.recipientAgeRange
    )
  ) {

    if (
      catalogueValueMatches(
        product.ageRange,
        input.recipientAgeRange
      )
    ) {

      score += 10;

      if (
        matches.indexOf("age") === -1
      ) {

        matches.push(
          "age"
        );
      }
    }
  }


  /*
   * Collection
   */

  if (
    cleanCatalogueString(
      input.collection ||
      input.requestedCollection
    )
  ) {

    if (
      catalogueValueMatches(
        product.collection,
        input.collection ||
        input.requestedCollection
      )
    ) {

      score += 25;

      matches.push(
        "collection"
      );
    }
  }


  /*
   * General natural-language request relevance.
   */

  if (
    cleanCatalogueString(
      input.request
    )
  ) {

    var requestWords =
      normalizeCatalogueValue(
        input.request
      )
        .split(/\s+/)
        .filter(function (word) {

          return word.length >= 3;

        });


    var productText =
      buildCatalogueProductText(
        product
      );


    var requestMatches =
      requestWords.filter(
        function (word) {

          return (
            productText.indexOf(word) !== -1
          );

        }
      );


    if (
      requestMatches.length
    ) {

      score += Math.min(
        requestMatches.length * 3,
        15
      );

      matches.push(
        "request"
      );
    }
  }


  return {

    score: score,

    matches: matches,

    withinBudget: null
  };
}


/* =========================================================
   BUDGET SCORING
   ========================================================= */

function applyCatalogueBudget(
  product,
  input,
  scoreResult
) {

  var budgetUSD =
    catalogueNumber(
      input.budgetUSD
    );

  var priceUSD =
    catalogueNumber(
      product.priceUSD
    );


  /*
   * No normalized USD budget or product price.
   *
   * Product/Catalogue cannot perform budget matching.
   */

  if (
    budgetUSD === null ||
    priceUSD === null
  ) {

    scoreResult.withinBudget =
      null;

    return scoreResult;
  }


  /*
   * Within budget.
   */

  if (
    priceUSD <= budgetUSD
  ) {

    scoreResult.score += 15;

    scoreResult.withinBudget =
      true;

    if (
      scoreResult.matches.indexOf(
        "budget"
      ) === -1
    ) {

      scoreResult.matches.push(
        "budget"
      );
    }

    return scoreResult;
  }


  /*
   * Above a strict maximum.
   *
   * This product is NOT eligible for the primary catalogue
   * result and will be hard-rejected later.
   */

  scoreResult.withinBudget =
    false;


  if (
    input.budgetType ===
    "maximum"
  ) {

    scoreResult.score -= 30;

    return scoreResult;
  }


  /*
   * Target/flexible budgets allow reasonable alternatives,
   * but the product is still marked as outside budget.
   */

  if (
    budgetUSD > 0
  ) {

    var difference =
      priceUSD - budgetUSD;

    var percentage =
      difference / budgetUSD;


    if (
      percentage <= 0.10
    ) {

      scoreResult.score -= 5;

    } else {

      scoreResult.score -= 15;
    }
  }


  return scoreResult;
}


/* =========================================================
   MAXIMUM-BUDGET ELIGIBILITY
   ========================================================= */

function isCatalogueProductEligible(
  input,
  scoreResult
) {

  /*
   * A maximum budget is a hard ceiling.
   *
   * Products above it must never enter the customer-facing
   * primary catalogue result.
   */

  if (
    input.budgetType ===
      "maximum" &&
    scoreResult.withinBudget ===
      false
  ) {

    return false;
  }


  return true;
}


/* =========================================================
   MATCH STATE
   ========================================================= */

function determineCatalogueMatchState(
  input,
  scoreResult
) {

  /*
   * Maximum-budget products outside the ceiling should never
   * reach this function as customer-facing products.
   */

  if (
    input.budgetType ===
      "maximum" &&
    scoreResult.withinBudget ===
      false
  ) {

    return "rejected";
  }


  if (
    scoreResult.score >= 75
  ) {

    return "exact_match";
  }


  if (
    scoreResult.score >= 55
  ) {

    return "strong_match";
  }


  if (
    scoreResult.score >= 30
  ) {

    return "alternative_match";
  }


  return "recommendation";
}


/* =========================================================
   CUSTOMER PREFERENCE LINES
   ========================================================= */

function buildCataloguePreferenceLines(
  input
) {

  var lines = [];


  if (
    cleanCatalogueString(
      input.category
    )
  ) {

    lines.push(
      "You asked for " +
      cleanCatalogueString(
        input.category
      ) +
      "."
    );
  }


  if (
    cleanCatalogueString(
      input.style
    )
  ) {

    lines.push(
      "Your preferred style is " +
      cleanCatalogueString(
        input.style
      ) +
      "."
    );
  }


  if (
    cleanCatalogueString(
      input.occasion
    )
  ) {

    lines.push(
      "The jewellery is being considered for " +
      cleanCatalogueString(
        input.occasion
      ) +
      "."
    );
  }


  if (
    cleanCatalogueString(
      input.recipient
    )
  ) {

    lines.push(
      "The intended recipient is " +
      cleanCatalogueString(
        input.recipient
      ) +
      "."
    );
  }


  if (
    cleanCatalogueString(
      input.recipientAgeRange
    )
  ) {

    lines.push(
      "The recipient age range is " +
      cleanCatalogueString(
        input.recipientAgeRange
      ) +
      "."
    );

  } else if (
    input.recipientAge !==
      undefined &&
    input.recipientAge !==
      null
  ) {

    lines.push(
      "The recipient age is " +
      input.recipientAge +
      "."
    );
  }


  if (
    cleanCatalogueString(
      input.collection ||
      input.requestedCollection
    )
  ) {

    lines.push(
      "You selected the " +
      cleanCatalogueString(
        input.collection ||
        input.requestedCollection
      ) +
      " collection."
    );
  }


  return lines;
}


/* =========================================================
   PRODUCT DESCRIPTION HIGHLIGHTS
   ========================================================= */

function getCatalogueDescriptionHighlights(
  description
) {

  var text =
    cleanCatalogueString(
      description
    );


  if (!text) {
    return [];
  }


  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(function (sentence) {

      return sentence.trim();

    })
    .filter(Boolean)
    .slice(0, 2);
}


/* =========================================================
   PRODUCT EXPLANATION
   ========================================================= */

function buildCatalogueProductExplanation(
  product,
  scoreResult
) {

  var preferenceLines = [];


  if (
    scoreResult.matches.indexOf(
      "category"
    ) !== -1
  ) {

    preferenceLines.push(
      "It matches the requested jewellery category."
    );
  }


  if (
    scoreResult.matches.indexOf(
      "collection"
    ) !== -1
  ) {

    preferenceLines.push(
      "It matches the requested collection."
    );
  }


  if (
    scoreResult.matches.indexOf(
      "style"
    ) !== -1
  ) {

    preferenceLines.push(
      "Its product information matches the requested style."
    );
  }


  if (
    scoreResult.matches.indexOf(
      "occasion"
    ) !== -1
  ) {

    preferenceLines.push(
      "Its product information matches the requested occasion."
    );
  }


  if (
    scoreResult.matches.indexOf(
      "recipient"
    ) !== -1
  ) {

    preferenceLines.push(
      "Its product information is relevant to the intended recipient."
    );
  }


  if (
    scoreResult.matches.indexOf(
      "age"
    ) !== -1
  ) {

    preferenceLines.push(
      "Its product information matches the recipient age information."
    );
  }


  return {

    preferenceMatches:
      scoreResult.matches,

    preferenceLines:
      preferenceLines,

    descriptionHighlights:
      getCatalogueDescriptionHighlights(
        product.description
      )
  };
}


/* =========================================================
   CUSTOMER-SAFE PRODUCT RESULT
   ========================================================= */

function buildCustomerCatalogueProduct(
  product,
  input,
  scoreResult
) {

  /*
   * IMPORTANT:
   *
   * Product/Catalogue does NOT perform FX conversion.
   *
   * The catalogue remains internally matched in USD.
   * Tool #9 Market Price Comparison owns customer-facing
   * conversion of verified USD prices through Bit 1B's
   * shared FX infrastructure.
   */

  return {

    productId:
      product.productId,

    variantId:
      product.variantId,

    title:
      product.title,

    handle:
      product.handle,

    url:
      product.url,

    image:
      product.image,

    description:
      product.description,

    productType:
      product.productType,

    category:
      product.category,

    collection:
      product.collection,

    style:
      product.style,

    occasion:
      product.occasion,

    recipient:
      product.recipient,

    age:
      product.age,

    ageRange:
      product.ageRange,

    /*
     * The underlying catalogue price is USD.
     *
     * No customer-currency calculation occurs here.
     */

    priceUSD:
      product.priceUSD,

    availability:
      product.availability,

    withinBudget:
      scoreResult.withinBudget,

    matchState:
      determineCatalogueMatchState(
        input,
        scoreResult
      ),

    matchScore:
      scoreResult.score,

    explanation:
      buildCatalogueProductExplanation(
        product,
        scoreResult
      )
  };
}


/* =========================================================
   SORT PRODUCTS
   ========================================================= */

function sortCatalogueProducts(
  products
) {

  return products.sort(
    function (a, b) {

      /*
       * Products within the customer's budget first.
       */

      if (
        a.withinBudget === true &&
        b.withinBudget !== true
      ) {

        return -1;
      }


      if (
        a.withinBudget !== true &&
        b.withinBudget === true
      ) {

        return 1;
      }


      /*
       * Then strongest match.
       */

      return (
        b.matchScore -
        a.matchScore
      );
    }
  );
}


/* =========================================================
   CREATE CATALOGUE RESULT
   ========================================================= */

async function createCatalogueResult(
  input
) {

  input =
    input || {};


  var requestedMarket =
    cleanCatalogueValue(
      input.shoppingCountry
    );


  var requestedDeliveryCountry =
    cleanCatalogueValue(
      input.deliveryCountry
    );


  var regionalAllowed =
    input.regionalSearch === true;


  var preferenceLines =
    buildCataloguePreferenceLines(
      input
    );


  /*
   * Retrieve actual products from the primary market.
   */

  var rawProducts =
    await getCatalogueProducts(
      input
    );


  /*
   * Normalize actual catalogue products.
   */

  var normalizedProducts =
    rawProducts
      .map(function (product) {

        return normalizeCatalogueProduct(
          product
        );

      })
      .filter(Boolean);


  /*
   * Score actual products.
   */

  var scoredProducts =
    normalizedProducts
      .map(function (product) {

        var scoreResult =
          scoreCatalogueProduct(
            product,
            input
          );


        scoreResult =
          applyCatalogueBudget(
            product,
            input,
            scoreResult
          );


        return {

          product:
            product,

          scoreResult:
            scoreResult

        };

      });


  /*
   * ========================================================
   * HARD MAXIMUM-BUDGET GATE
   * ========================================================
   *
   * A product above a customer's maximum budget is not
   * allowed into the returned catalogue result.
   *
   * This is deliberately done BEFORE building the
   * customer-facing product objects.
   */

  var budgetEligibleScoredProducts =
    scoredProducts.filter(
      function (entry) {

        return isCatalogueProductEligible(
          input,
          entry.scoreResult
        );

      }
    );


  /*
   * Build customer-safe products only after the budget gate.
   */

  var customerProducts =
    budgetEligibleScoredProducts
      .map(function (entry) {

        return buildCustomerCatalogueProduct(
          entry.product,
          input,
          entry.scoreResult
        );

      });


  /*
   * Sort strongest products first.
   */

  customerProducts =
    sortCatalogueProducts(
      customerProducts
    );


  /*
   * Respect maxResults.
   */

  var maxResults =
    catalogueNumber(
      input.maxResults
    );


  if (
    maxResults === null ||
    maxResults <= 0
  ) {

    maxResults = 10;
  }


  var productsToReturn =
    customerProducts.slice(
      0,
      maxResults
    );


  /*
   * Separate match states.
   */

  var exactMatches =
    productsToReturn.filter(
      function (product) {

        return (
          product.matchState ===
          "exact_match"
        );

      }
    );


  var strongMatches =
    productsToReturn.filter(
      function (product) {

        return (
          product.matchState ===
          "strong_match"
        );

      }
    );


  var alternativeMatches =
    productsToReturn.filter(
      function (product) {

        return (
          product.matchState ===
          "alternative_match"
        );

      }
    );


  var recommendations =
    productsToReturn.filter(
      function (product) {

        return (
          product.matchState ===
          "recommendation"
        );

      }
    );


  /*
   * Determine whether Product/Catalogue has a useful primary
   * market result.
   */

  var hasSuitablePrimaryProduct =
    customerProducts.some(
      function (product) {

        return (
          product.matchState ===
            "exact_match" ||
          product.matchState ===
            "strong_match" ||
          product.matchState ===
            "alternative_match" ||
          product.matchState ===
            "recommendation"
        );

      }
    );


  /*
   * IMPORTANT:
   *
   * Regional products are NOT inserted into this result.
   *
   * Regional Market owns regional fallback.
   */

  var regionalFallbackRequired =
    !hasSuitablePrimaryProduct &&
    regionalAllowed;


  return {

    success: true,

    brand:
      "GodreryTone",


    catalogueIntent: {

      request:
        cleanCatalogueValue(
          input.request
        ),

      shoppingCountry:
        requestedMarket,

      deliveryCountry:
        requestedDeliveryCountry,

      category:
        cleanCatalogueValue(
          input.category
        ),

      style:
        cleanCatalogueValue(
          input.style
        ),

      occasion:
        cleanCatalogueValue(
          input.occasion
        ),

      recipient:
        cleanCatalogueValue(
          input.recipient
        ),

      recipientAge:
        cleanCatalogueValue(
          input.recipientAge
        ),

      recipientAgeRange:
        cleanCatalogueValue(
          input.recipientAgeRange
        ),

      budget:
        cleanCatalogueValue(
          input.budget
        ),

      budgetType:
        input.budgetType ||
        "unknown",

      budgetCurrency:
        cleanCatalogueValue(
          input.budgetCurrency
        ),

      /*
       * This is consumed from Budget / Currency.
       * Product/Catalogue does not calculate it.
       */

      budgetUSD:
        catalogueNumber(
          input.budgetUSD
        ),

      customerCurrency:
        cleanCatalogueValue(
          input.customerCurrency ||
          input.budgetCurrency
        ),

      regionalSearch:
        regionalAllowed,

      regionalPriority:
        input.regionalPriority ||
        "balanced",

      shippingFlexibility:
        input.shippingFlexibility ||
        "unknown",

      priceSensitivity:
        input.priceSensitivity ||
        "unknown",

      maxResults:
        maxResults
    },


    catalogueRules: {

      selectedMarketIsPrimary:
        true,

      searchSelectedMarketFirst:
        true,

      useActualStorefrontProducts:
        true,

      useActualMarketPrice:
        true,

      matchCatalogueInUSD:
        true,

      /*
       * Product/Catalogue consumes USD pricing but does not
       * perform customer-currency conversion.
       */

      convertForCustomerPresentation:
        false,

      customerPriceConversionOwner:
        "godrerytone_market_price_comparison",

      sharedFXInfrastructureOwner:
        "GodreryTone Bit 1B",

      neverInventProducts:
        true,

      neverInventPrices:
        true,

      neverAssumeProductExistsInEveryMarket:
        true,

      neverAssumeSamePriceAcrossMarkets:
        true,

      neverSilentlySwitchMarket:
        true,

      regionalProductsRequirePermission:
        true,

      regionalProductsNotMixedWithPrimaryResults:
        true,

      regionalFallbackOwnedByRegionalMarket:
        true,

      verifyShippingBeforeRegionalPurchase:
        true,

      supplierIdentityCustomerVisible:
        false,

      vendorIdentityCustomerVisible:
        false,

      brandIdentityCustomerVisible:
        false,

      maximumBudgetIsHardCeiling:
        true,

      productsAboveMaximumBudgetExcluded:
        true
    },


    customerPreferences: {

      preferenceLines:
        preferenceLines
    },


    productSelection: {

      status:
        hasSuitablePrimaryProduct
          ? "primary_market_products_found"
          : "no_suitable_primary_market_product",

      exactMatches:
        exactMatches,

      strongMatches:
        strongMatches,

      alternativeMatches:
        alternativeMatches,

      recommendations:
        recommendations,

      products:
        productsToReturn
    },


    pricing: {

      catalogueCurrency:
        "USD",

      budgetMatchingCurrency:
        "USD",

      budgetUSD:
        catalogueNumber(
          input.budgetUSD
        ),

      customerCurrency:
        cleanCatalogueValue(
          input.customerCurrency ||
          input.budgetCurrency
        ),

      /*
       * Budget #7 owns normalization into USD.
       */

      budgetNormalizationOwner:
        "godrerytone_budget",

      /*
       * Market Price Comparison #9 owns conversion of
       * verified USD product prices into the customer's
       * preferred presentation currency.
       */

      customerPriceConversionOwner:
        "godrerytone_market_price_comparison",

      customerPriceConversionStatus:
        "delegated_to_market_price_comparison",

      exchangeRateUsedHere:
        false,

      independentFXCalculation:
        false
    },


    regionalFallback: {

      required:
        regionalFallbackRequired,

      permitted:
        regionalAllowed,

      owner:
        "godrerytone_regional_market",

      reason:
        regionalFallbackRequired
          ? "No suitable primary-market product was found."
          : null,

      primaryMarketProductsExcluded:
        true
    },


    customerDataProtection: {

      supplierNamesHidden:
        true,

      vendorNamesHidden:
        true,

      brandNamesHidden:
        true,

      internalMarketIdentifiersHidden:
        true,

      internalCatalogueIdentifiersHidden:
        true,

      internalCommerceRelationshipsHidden:
        true
    },


    agentGuidance: [

      "Search the customer's selected market first.",

      "Use actual GodreryTone catalogue products rather than inventing products.",

      "Use actual product titles, URLs, images, availability, variant information, descriptions, and prices when supplied by the storefront data source.",

      "Treat the customer's selected market as the source of truth for the initial product search.",

      "Match the store catalogue against the customer's USD-normalized budget supplied by Budget.",

      "Product/Catalogue does not calculate exchange rates.",

      "Product/Catalogue does not perform independent currency conversion.",

      "Budget / Currency owns customer-budget normalization into USD.",

      "Market Price Comparison owns customer-facing conversion of verified USD product prices into the customer's preferred currency.",

      "Do not invent or hardcode an exchange rate.",

      "Do not assume that a product available in one market is available in another market.",

      "Do not assume that the same product has the same price in different markets.",

      "Do not silently switch the customer's market because another market has a cheaper product.",

      "Use category, style, occasion, recipient, applicable age information, and budget as recommendation signals.",

      "Use recipient age only when provided and relevant.",

      "Do not force missing preferences.",

      "A maximum budget must be treated as a real ceiling.",

      "Products above a maximum budget must be excluded from the returned primary catalogue results.",

      "Do not present a product above a maximum budget as a budget-fitting alternative.",

      "A target budget should prioritize products around the target without treating it as an absolute ceiling.",

      "A flexible budget should prioritize suitability and value rather than applying a hard ceiling.",

      "If no suitable exact match exists within the applicable budget rules, recommend strong or alternative legitimate products instead of falsely claiming an exact match.",

      "No exact match does not automatically mean there is no useful recommendation.",

      "If no suitable primary-market recommendation exists, do not silently introduce regional products.",

      "Regional fallback belongs to the Regional Market tool.",

      "Regional products must be evaluated separately and must retain their own market-specific price and commerce conditions.",

      "Before a regional product is presented as actionable, its delivery eligibility, shipping cost, shipping time, and relevant market conditions must be resolved.",

      "Supplier, vendor, and brand identities are internal commerce information and must not be exposed in the customer-facing product result.",

      "Product explanations must be grounded in actual product information and must not invent materials, quality, symbolism, craftsmanship, or other unsupported attributes."

    ],


    productSelectionOrder: [

      "1. Customer's selected shopping market.",

      "2. Actual product availability in that market.",

      "3. Match to requested jewellery category.",

      "4. Match to stated style.",

      "5. Match to occasion.",

      "6. Match to recipient and applicable age information.",

      "7. Match to USD-normalized budget.",

      "8. Customer's price sensitivity.",

      "9. Recommendation quality when an exact match is unavailable.",

      "10. Regional alternatives only through the Regional Market tool when permitted.",

      "11. Shipping eligibility before presenting a regional purchase as actionable.",

      "12. Customer-facing currency conversion only through Market Price Comparison using Bit 1B verified FX infrastructure."

    ],


    expectedProductData: {

      productId:
        "Actual Shopify product identifier when available.",

      variantId:
        "Actual Shopify variant identifier when available.",

      title:
        "Actual product title.",

      handle:
        "Actual Shopify product handle.",

      url:
        "Actual storefront product URL.",

      image:
        "Actual product image URL when available.",

      description:
        "Actual storefront product description when available.",

      price:
        "Actual catalogue price, internally matched in USD.",

      priceUSD:
        "Actual catalogue price in USD used for catalogue matching.",

      currency:
        "Catalogue currency, currently USD.",

      customerPrice:
        "Not calculated by Product/Catalogue. Customer-facing conversion is owned by Market Price Comparison.",

      customerCurrency:
        "Customer's preferred presentation currency.",

      availability:
        "Actual product availability.",

      market:
        "Internal market context used for retrieval and resolution."

    },


    nextStep:
      hasSuitablePrimaryProduct
        ? "Present the strongest customer-safe products from the customer's selected market. Customer-facing currency conversion is handled downstream by Market Price Comparison."
        : regionalFallbackRequired
          ? "Pass the request to Regional Market for permitted fallback-market investigation."
          : "No suitable primary-market product was found. Do not silently switch markets."
  };
}


/* =========================================================
   WEBMCP REGISTRATION
   ========================================================= */

try {

  document.modelContext.registerTool({

    name:
      productCatalogueToolName,

    description:
      "Search and recommend actual GodreryTone jewellery products from the customer's selected primary market using category, style, occasion, recipient, applicable age, and the customer's USD-normalized budget. Match actual storefront products against the fixed USD catalogue. Do not perform independent currency conversion; customer-facing USD-to-customer-currency conversion is handled by Market Price Comparison through Bit 1B's verified FX infrastructure. Do not invent products or prices, silently switch markets, mix regional products into primary results, or expose supplier, vendor, or brand identities.",

    inputSchema:
      productCatalogueSchema,

    execute:
      async function (input) {

        return JSON.stringify(
          await createCatalogueResult(
            input
          )
        );

      }

  });


  console.info(
    "[GodreryTone WebMCP] product catalogue tool registered successfully."
  );


} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Product catalogue tool registration failed:",
    error
  );

}/* =========================================================
   GODRERYTONE #9
   MARKET-AWARE PRICING LOGIC
   ========================================================= */


/* =========================================================
   MAIN MARKET PRICE COMPARISON
   ========================================================= */

async function gtCompareMarketPrices(input) {

  input = input || {};


  /* =======================================================
     BASIC HELPERS
     ======================================================= */

  function clean(value) {

    if (
      value === undefined ||
      value === null
    ) {

      return "";
    }

    return String(value).trim();
  }


  function cleanString(value) {

    var result =
      clean(value);

    return result || null;
  }


  function cleanArray(value) {

    return Array.isArray(value)
      ? value
      : [];
  }


  function normalizeCountry(value) {

    return clean(value)
      .toUpperCase();
  }


  function normalizeCurrency(value) {

    var currency =
      clean(value)
        .toUpperCase();

    return currency || null;
  }


  function normalizeNumber(value) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {

      return null;
    }


    var number =
      Number(value);


    return Number.isFinite(number)
      ? number
      : null;
  }


  function getDataLayer() {

    if (
      window.GodreryToneWebMCP &&
      window.GodreryToneWebMCP.data
    ) {

      return window.GodreryToneWebMCP.data;
    }


    return null;
  }


  function getCurrencyLayer() {

    if (
      window.GodreryToneWebMCP &&
      window.GodreryToneWebMCP.currency
    ) {

      return window.GodreryToneWebMCP.currency;
    }


    return null;
  }


  function getRegistry() {

    if (
      window.GodreryToneWebMCP &&
      window.GodreryToneWebMCP.registry
    ) {

      return window.GodreryToneWebMCP.registry;
    }


    return null;
  }


  /* =======================================================
     INTERNAL MARKET RESOLUTION
     ======================================================= */

  /*
   * Resolve the internal market from the customer's
   * shopping country.
   *
   * Internal market information is never returned
   * in the customer-facing pricing result.
   */

  function findMarketForCountry(country) {

    var registry =
      getRegistry();


    if (
      !registry ||
      !registry.marketCountryAssignments
    ) {

      return null;
    }


    var normalizedCountry =
      normalizeCountry(country);


    if (!normalizedCountry) {

      return null;
    }


    var assignments =
      registry.marketCountryAssignments;


    for (
      var marketId in assignments
    ) {

      if (
        !Object.prototype.hasOwnProperty.call(
          assignments,
          marketId
        )
      ) {

        continue;
      }


      var countries =
        cleanArray(
          assignments[marketId]
        );


      for (
        var i = 0;
        i < countries.length;
        i++
      ) {

        if (
          normalizeCountry(
            countries[i]
          ) === normalizedCountry
        ) {

          return marketId;
        }
      }
    }


    return null;
  }


  /* =======================================================
     MARKET PRICE READING
     ======================================================= */

  /*
   * Read a market-price object's price without
   * inventing or modifying the value.
   */

  function getPriceValue(
    marketPrice
  ) {

    if (
      !marketPrice ||
      typeof marketPrice !== "object"
    ) {

      return null;
    }


    return normalizeNumber(
      marketPrice.price
    );
  }


  function getPriceCurrency(
    marketPrice
  ) {

    if (
      !marketPrice ||
      typeof marketPrice !== "object"
    ) {

      return null;
    }


    return cleanString(
      marketPrice.currency
    );
  }


  function getPriceCountry(
    marketPrice
  ) {

    if (
      !marketPrice ||
      typeof marketPrice !== "object"
    ) {

      return null;
    }


    return cleanString(
      marketPrice.country ||
      marketPrice.shoppingCountry
    );
  }


  /*
   * The store catalogue is fixed in USD.
   *
   * We only treat a price as USD when the supplied
   * price currency actually says USD.
   *
   * No exchange-rate calculation happens here.
   */

  function getPriceUSD(
    marketPrice
  ) {

    var price =
      getPriceValue(
        marketPrice
      );


    var currency =
      getPriceCurrency(
        marketPrice
      );


    if (
      price === null ||
      !currency ||
      normalizeCurrency(currency) !== "USD"
    ) {

      return null;
    }


    return price;
  }


  /* =======================================================
     CUSTOMER-CURRENCY CONVERSION
     ======================================================= */

  /*
   * #9 owns customer-facing conversion of a VERIFIED
   * USD market price.
   *
   * It does not calculate or invent an exchange rate.
   *
   * Bit 1B owns the shared FX infrastructure.
   */

  async function convertUSDPriceToCustomerCurrency(
    priceUSD,
    customerCurrency
  ) {

    var currency =
      normalizeCurrency(
        customerCurrency
      );


    if (
      priceUSD === null ||
      !currency
    ) {

      return {

        status:
          "unavailable",

        amount:
          null,

        currency:
          currency,

        rate:
          null,

        timestamp:
          null,

        source:
          null,

        verified:
          false
      };
    }


    var currencyLayer =
      getCurrencyLayer();


    if (
      !currencyLayer ||
      typeof currencyLayer.fromUSD !==
        "function"
    ) {

      return {

        status:
          "unavailable",

        amount:
          null,

        currency:
          currency,

        rate:
          null,

        timestamp:
          null,

        source:
          null,

        verified:
          false
      };
    }


    try {

      /*
       * Use the shared Bit 1B FX infrastructure.
       *
       * No exchange rate is supplied by the caller.
       */

      var result =
        await currencyLayer.fromUSD(
          priceUSD,
          currency
        );


      if (
        !result ||
        result.status !== "ok" ||
        !result.data
      ) {

        return {

          status:
            "unavailable",

          amount:
            null,

          currency:
            currency,

          rate:
            null,

          timestamp:
            null,

          source:
            null,

          verified:
            false
        };
      }


      var data =
        result.data;


      var convertedAmount =
        normalizeNumber(
          data.convertedAmount
        );


      var rate =
        normalizeNumber(
          data.rate
        );


      var timestamp =
        cleanString(
          data.timestamp
        );


      var source =
        cleanString(
          data.source
        );


      var verified =
        data.verified === true;


      /*
       * Do not expose a converted customer price unless
       * the FX result itself is verified.
       */

      if (
        convertedAmount === null ||
        convertedAmount < 0 ||
        rate === null ||
        rate <= 0 ||
        !timestamp ||
        !verified
      ) {

        return {

          status:
            "unavailable",

          amount:
            null,

          currency:
            currency,

          rate:
            null,

          timestamp:
            null,

          source:
            null,

          verified:
            false
        };
      }


      return {

        status:
          "verified",

        amount:
          convertedAmount,

        currency:
          currency,

        rate:
          rate,

        timestamp:
          timestamp,

        source:
          source,

        verified:
          true
      };


    } catch (error) {

      console.warn(
        "[GodreryTone WebMCP] Customer currency conversion failed:",
        error
      );


      return {

        status:
          "unavailable",

        amount:
          null,

        currency:
          currency,

        rate:
          null,

        timestamp:
          null,

        source:
          null,

        verified:
          false
      };
    }
  }


  /* =======================================================
     PRIMARY MARKET PRICE
     ======================================================= */

  /*
   * Find the price belonging to the customer's
   * resolved primary market.
   *
   * The customer's shopping country is used as the
   * country context for the market.
   */

  function findPrimaryMarketPrice(
    marketPrices,
    shoppingCountry,
    primaryMarketId
  ) {

    var normalizedShoppingCountry =
      normalizeCountry(
        shoppingCountry
      );


    /*
     * First prefer an explicitly matching shopping country.
     */

    for (
      var i = 0;
      i < marketPrices.length;
      i++
    ) {

      var marketPrice =
        marketPrices[i];


      if (
        !marketPrice ||
        typeof marketPrice !== "object"
      ) {

        continue;
      }


      var country =
        getPriceCountry(
          marketPrice
        );


      if (
        country &&
        normalizeCountry(
          country
        ) === normalizedShoppingCountry
      ) {

        return marketPrice;
      }
    }


    /*
     * If current commerce data exposes a market identifier,
     * allow it to identify the primary market.
     *
     * This remains internal and is never returned to the customer.
     */

    if (primaryMarketId) {

      for (
        var j = 0;
        j < marketPrices.length;
        j++
      ) {

        var candidate =
          marketPrices[j];


        if (
          !candidate ||
          typeof candidate !== "object"
        ) {

          continue;
        }


        if (
          candidate.marketId &&
          clean(candidate.marketId) ===
            clean(primaryMarketId)
        ) {

          return candidate;
        }
      }
    }


    /*
     * Do not guess a primary-market price.
     */

    return null;
  }


  /* =======================================================
     REGIONAL PRICES
     ======================================================= */

  /*
   * Build regional prices only from the regional
   * countries explicitly supplied by Regional Market.
   *
   * #9 does NOT discover neighbouring countries.
   */

  function buildRegionalPrices(
    marketPrices,
    regionalSearch,
    regionalMarkets
  ) {

    if (!regionalSearch) {

      return [];
    }


    var permittedCountries =
      cleanArray(
        regionalMarkets
      );


    if (
      !permittedCountries.length
    ) {

      return [];
    }


    var results = [];


    marketPrices.forEach(
      function(marketPrice) {

        if (
          !marketPrice ||
          typeof marketPrice !== "object"
        ) {

          return;
        }


        var country =
          getPriceCountry(
            marketPrice
          );


        if (!country) {

          return;
        }


        var normalizedCountry =
          normalizeCountry(
            country
          );


        var permitted =
          permittedCountries.some(
            function(region) {

              return (
                normalizeCountry(
                  region
                ) === normalizedCountry
              );

            }
          );


        if (!permitted) {

          return;
        }


        results.push({

          country:
            country,

          price:
            getPriceValue(
              marketPrice
            ),

          currency:
            getPriceCurrency(
              marketPrice
            ),

          priceUSD:
            getPriceUSD(
              marketPrice
            )
        });

      }
    );


    return results;
  }


  /* =======================================================
     INPUT CONTEXT
     ======================================================= */

  var shoppingCountry =
    cleanString(
      input.shoppingCountry
    );


  var shoppingCurrency =
    normalizeCurrency(
      input.shoppingCurrency ||
      input.customerCurrency
    );


  var customerCurrency =
    normalizeCurrency(
      input.customerCurrency ||
      input.shoppingCurrency
    );


  var regionalSearch =
    input.regionalSearch === true;


  var regionalMarkets =
    cleanArray(
      input.regionalMarkets
    );


  var products =
    cleanArray(
      input.products
    );


  /*
   * Resolve the internal primary market.
   *
   * Internal market ID is used only internally.
   */

  var primaryMarketId =
    findMarketForCountry(
      shoppingCountry
    );


  var results = [];


  /* =======================================================
     PROCESS PRODUCTS
     ======================================================= */

  for (
    var productIndex = 0;
    productIndex < products.length;
    productIndex++
  ) {

    var product =
      products[productIndex];


    if (
      !product ||
      typeof product !== "object"
    ) {

      continue;
    }


    var marketPrices =
      cleanArray(
        product.marketPrices
      );


    /*
     * Primary market is always resolved first.
     */

    var primaryMarketPrice =
      findPrimaryMarketPrice(
        marketPrices,
        shoppingCountry,
        primaryMarketId
      );


    /*
     * Regional prices are considered only when
     * Regional Market has permitted regional searching.
     */

    var regionalPrices =
      buildRegionalPrices(
        marketPrices,
        regionalSearch,
        regionalMarkets
      );


    /* =====================================================
       PRIMARY USD PRICE
       ===================================================== */

    var primaryPriceUSD =
      getPriceUSD(
        primaryMarketPrice
      );


    /*
     * Customer-facing conversion of the primary
     * verified USD price.
     */

    var primaryCustomerPrice = {

      status:
        "unavailable",

      amount:
        null,

      currency:
        customerCurrency,

      rate:
        null,

      timestamp:
        null,

      source:
        null,

      verified:
        false
    };


    if (
      primaryPriceUSD !== null &&
      customerCurrency
    ) {

      primaryCustomerPrice =
        await convertUSDPriceToCustomerCurrency(
          primaryPriceUSD,
          customerCurrency
        );
    }


    /* =====================================================
       REGIONAL USD COMPARISON
       ===================================================== */

    /*
     * We only compare prices directly when both
     * prices are verified in USD.
     *
     * No cross-currency arithmetic is performed here.
     */

    var cheaperRegionalOptions = [];


    if (
      primaryPriceUSD !== null
    ) {

      regionalPrices.forEach(
        function(option) {

          var regionalPriceUSD =
            option.priceUSD;


          if (
            regionalPriceUSD !== null &&
            regionalPriceUSD <
              primaryPriceUSD
          ) {

            cheaperRegionalOptions.push({

              country:
                option.country,

              price:
                option.price,

              currency:
                option.currency,

              priceUSD:
                regionalPriceUSD
            });
          }

        }
      );
    }


    /* =====================================================
       REGIONAL CUSTOMER-CURRENCY PRICES
       ===================================================== */

    /*
     * Convert regional prices individually from their
     * verified USD market price.
     *
     * This is presentation only.
     *
     * Regional comparison itself remains USD-based.
     */

    var regionalCustomerPrices = [];


    for (
      var regionalIndex = 0;
      regionalIndex <
        regionalPrices.length;
      regionalIndex++
    ) {

      var regionalOption =
        regionalPrices[
          regionalIndex
        ];


      var regionalCustomerPrice = {

        status:
          "unavailable",

        amount:
          null,

        currency:
          customerCurrency,

        rate:
          null,

        timestamp:
          null,

        source:
          null,

        verified:
          false
      };


      if (
        regionalOption.priceUSD !== null &&
        customerCurrency
      ) {

        regionalCustomerPrice =
          await convertUSDPriceToCustomerCurrency(
            regionalOption.priceUSD,
            customerCurrency
          );
      }


      regionalCustomerPrices.push({

        country:
          regionalOption.country,

        priceUSD:
          regionalOption.priceUSD,

        originalMarketPrice:
          regionalOption.price,

        originalMarketCurrency:
          regionalOption.currency,

        customerPrice:
          regionalCustomerPrice.amount,

        customerCurrency:
          regionalCustomerPrice.currency,

        customerPriceConversionStatus:
          regionalCustomerPrice.status,

        customerPriceExchangeRate:
          regionalCustomerPrice.rate,

        customerPriceExchangeRateTimestamp:
          regionalCustomerPrice.timestamp,

        customerPriceExchangeRateSource:
          regionalCustomerPrice.source,

        customerPriceConversionVerified:
          regionalCustomerPrice.verified
      });
    }


    /* =====================================================
       CHEAPER REGIONAL CUSTOMER-CURRENCY OPTIONS
       ===================================================== */

    /*
     * Only use the already-established USD comparison
     * to determine whether a regional option is cheaper.
     *
     * We do NOT compare converted customer-currency
     * values independently.
     */

    var cheaperRegionalCustomerPrices =
      regionalCustomerPrices.filter(
        function(option) {

          return cheaperRegionalOptions.some(
            function(cheaperOption) {

              return (
                normalizeCountry(
                  cheaperOption.country
                ) ===
                normalizeCountry(
                  option.country
                )
              );

            }
          );

        }
      );


    /* =====================================================
       PRIMARY PRICING STATUS
       ===================================================== */

    var primaryPriceAvailable =
      primaryMarketPrice !== null;


    var primaryPriceVerifiedUSD =
      primaryPriceUSD !== null;


    var customerPriceConversionVerified =
      primaryCustomerPrice.verified === true;


    var customerPriceReady =
      primaryPriceVerifiedUSD &&
      customerPriceConversionVerified &&
      customerCurrency !== null &&
      primaryCustomerPrice.amount !== null;


    /*
     * Pricing status deliberately distinguishes:
     *
     * verified:
     *   USD market price is verified and customer-facing
     *   conversion is also verified.
     *
     * usd_verified_customer_conversion_pending:
     *   USD price exists but customer-currency presentation
     *   has not yet been verified.
     *
     * unknown:
     *   applicable market-specific price itself is unavailable.
     */

    var pricingStatus =
      !primaryPriceAvailable
        ? "unknown"
        : primaryPriceVerifiedUSD
          ? customerPriceReady
            ? "verified"
            : "usd_verified_customer_conversion_pending"
          : "unknown";


    /* =====================================================
       RESULT
       ===================================================== */

    results.push({

      productHandle:
        cleanString(
          product.handle
        ),

      productTitle:
        cleanString(
          product.title
        ),


      primaryMarketPrice:
        primaryMarketPrice
          ? {

              country:
                getPriceCountry(
                  primaryMarketPrice
                ),

              price:
                getPriceValue(
                  primaryMarketPrice
                ),

              currency:
                getPriceCurrency(
                  primaryMarketPrice
                ),

              priceUSD:
                primaryPriceUSD

            }
          : null,


      /*
       * Customer-facing primary price.
       *
       * This exists only when Bit 1B verified the FX
       * conversion.
       */

      customerPrice:
        customerPriceConversionVerified
          ? primaryCustomerPrice.amount
          : null,


      customerCurrency:
        customerCurrency,


      customerPriceConversion:
        {

          status:
            primaryCustomerPrice.status,

          amount:
            customerPriceConversionVerified
              ? primaryCustomerPrice.amount
              : null,

          currency:
            primaryCustomerPrice.currency,

          rate:
            primaryCustomerPrice.rate,

          timestamp:
            primaryCustomerPrice.timestamp,

          source:
            primaryCustomerPrice.source,

          verified:
            primaryCustomerPrice.verified
        },


      regionalPrices:
        regionalPrices.map(
          function(option) {

            return {

              country:
                option.country,

              price:
                option.price,

              currency:
                option.currency,

              priceUSD:
                option.priceUSD

            };

          }
        ),


      /*
       * Regional customer-facing converted prices.
       */

      regionalCustomerPrices:
        regionalCustomerPrices.map(
          function(option) {

            return {

              country:
                option.country,

              priceUSD:
                option.priceUSD,

              originalMarketPrice:
                option.originalMarketPrice,

              originalMarketCurrency:
                option.originalMarketCurrency,

              customerPrice:
                option.customerPrice,

              customerCurrency:
                option.customerCurrency,

              conversionStatus:
                option.customerPriceConversionStatus,

              exchangeRate:
                option.customerPriceExchangeRate,

              exchangeRateTimestamp:
                option.customerPriceExchangeRateTimestamp,

              exchangeRateSource:
                option.customerPriceExchangeRateSource,

              conversionVerified:
                option.customerPriceConversionVerified

            };

          }
        ),


      /*
       * Regional price advantages remain based on
       * verified USD comparison.
       */

      cheaperRegionalOptions:
        cheaperRegionalOptions.map(
          function(option) {

            return {

              country:
                option.country,

              price:
                option.price,

              currency:
                option.currency,

              priceUSD:
                option.priceUSD

            };

          }
        ),


      cheaperRegionalCustomerPrices:
        cheaperRegionalCustomerPrices.map(
          function(option) {

            return {

              country:
                option.country,

              priceUSD:
                option.priceUSD,

              customerPrice:
                option.customerPrice,

              customerCurrency:
                option.customerCurrency,

              conversionStatus:
                option.customerPriceConversionStatus,

              exchangeRate:
                option.customerPriceExchangeRate,

              exchangeRateTimestamp:
                option.customerPriceExchangeRateTimestamp,

              exchangeRateSource:
                option.customerPriceExchangeRateSource,

              conversionVerified:
                option.customerPriceConversionVerified

            };

          }
        ),


      primaryMarketPriceAvailable:
        primaryPriceAvailable,


      primaryMarketPriceVerifiedUSD:
        primaryPriceVerifiedUSD,


      customerPriceConversionPerformed:
        primaryPriceVerifiedUSD &&
        customerCurrency !== null,


      customerPriceConversionVerified:
        customerPriceConversionVerified,


      customerPricePresentationReady:
        customerPriceReady,


      regionalPriceComparisonPerformed:
        regionalSearch === true &&
        regionalPrices.length > 0,


      cheaperRegionalOptionExists:
        cheaperRegionalOptions.length > 0,


      pricingStatus:
        pricingStatus
    });
  }


  /* =======================================================
     FINAL RESULT
     ======================================================= */

  return {

    success:
      true,

    brand:
      "GodreryTone",

    marketPricing: {

      shoppingCountry:
        shoppingCountry,

      shoppingCurrency:
        shoppingCurrency,

      customerCurrency:
        customerCurrency,

      regionalSearch:
        regionalSearch,

      products:
        results
    },


    rules: [

      "Always use the customer's shopping country as the primary market context.",

      "Resolve the customer's internal market before evaluating the primary-market price.",

      "Present and evaluate the primary-market price before considering regional prices.",

      "Never assume that the same product has the same price in different markets.",

      "Treat every market price as a separate market-specific price.",

      "Only compare regional prices when regional searching has been permitted.",

      "Regional Market is responsible for determining which regional countries may be considered.",

      "Do not independently discover or invent neighbouring markets.",

      "A lower regional-market price does not become the customer's primary-market price.",

      "Never silently move the customer from the selected market to another market.",

      "A regional price advantage does not establish shipping eligibility.",

      "Shipping Eligibility must separately verify whether a regional product can ship to the customer's delivery country.",

      "Cross-market price comparison is performed only when the compared market prices are verified in USD.",

      "Budget owns normalization of the customer's budget into USD.",

      "Market Price Comparison owns customer-facing conversion of verified USD product prices into the customer's preferred currency.",

      "Use Bit 1B shared FX infrastructure for customer-facing currency conversion.",

      "Never perform independent or hardcoded currency conversion.",

      "Never accept a caller-supplied exchange rate as authoritative.",

      "Never invent, estimate, or alter an unavailable market-specific price.",

      "A customer-facing converted price is ready only when the Bit 1B conversion result is verified.",

      "If customer-currency conversion cannot be verified, retain the verified USD price and return the customer-facing conversion as unavailable.",

      "Product Catalogue owns the actual customer-facing product catalogue.",

      "Supplier and internal market information must not be exposed to the customer."

    ],


    agentGuidance: {

      primaryMarket:
        "Use the customer's selected shopping country to establish the primary market context and evaluate its price first.",

      sameProductDifferentPrice:
        "If the same product has different prices in different markets, keep each market price separate.",

      cheaperRegionalMarket:
        "If a permitted regional market has a lower verified USD price, identify it as a regional-market price rather than treating it as the customer's primary-market price.",

      regionalPermission:
        "Do not compare or present regional pricing unless regional searching has been permitted.",

      shippingCheck:
        "A cheaper regional price must not be presented as a viable purchase path until Shipping Eligibility verifies destination eligibility.",

      budgetConversion:
        "Budget owns conversion of the customer's stated budget into USD. Market Price Comparison does not normalize the customer's budget.",

      productPriceConversion:
        "Market Price Comparison converts verified USD product prices into the customer's preferred currency using Bit 1B shared FX infrastructure.",

      fxInfrastructure:
        "Use GT.currency.fromUSD() for customer-facing conversion. Never perform independent or hardcoded FX calculations.",

      conversionVerification:
        "Only present a converted customer-facing price when the FX result contains a verified conversion.",

      conversionFailure:
        "If FX conversion cannot be verified, do not invent or estimate the customer-currency price. Keep the verified USD price and mark customer-currency presentation as unavailable.",

      customerChoice:
        "If proceeding with a regional price requires a different market or shipping arrangement, the customer must be informed and given the appropriate choice.",

      unknownPrice:
        "If the applicable market-specific price cannot be verified, return an unknown pricing state rather than inventing a price."

    },


    nextStep:
      "Pass verified market-specific pricing to Shipping Eligibility and then Purchase Readiness. Customer-facing product-price conversion is completed here through Bit 1B verified FX infrastructure."
  };
}


/* =========================================================
   WEBMCP REGISTRATION
   ========================================================= */

try {

  document.modelContext.registerTool({

    name:
      "godrerytone_market_price_comparison",

    description:
      "Compare verified GodreryTone product prices across the customer's primary market and permitted regional markets while keeping each market's price separate. Convert verified USD product prices into the customer's preferred currency using Bit 1B's shared verified FX infrastructure for customer-facing presentation. Budget owns budget normalization into USD. This tool does not discover products, determine shipping eligibility, perform independent or hardcoded currency math, or silently change the customer's market.",

    inputSchema: {

      type:
        "object",

      properties: {

        shoppingCountry: {

          type:
            "string",

          description:
            "The customer's shopping country. This country is used to resolve the applicable internal market."
        },


        shoppingCurrency: {

          type:
            "string",

          description:
            "The customer's applicable shopping currency, when known."
        },


        customerCurrency: {

          type:
            "string",

          description:
            "The currency in which the customer wants verified product prices presented."
        },


        regionalSearch: {

          type:
            "boolean",

          description:
            "Whether the customer has permitted regional or neighbouring-market consideration."
        },


        regionalMarkets: {

          type:
            "array",

          items: {

            type:
              "string"
          },

          description:
            "Regional countries explicitly permitted for comparison by the Regional Market logic."
        },


        products: {

          type:
            "array",

          description:
            "Products already identified by Product Catalogue with their verified market-specific prices.",

          items: {

            type:
              "object",

            properties: {

              handle: {

                type:
                  "string"
              },


              title: {

                type:
                  "string"
              },


              marketPrices: {

                type:
                  "array",

                items: {

                  type:
                    "object",

                  properties: {

                    country: {

                      type:
                        "string"
                    },


                    price: {

                      type:
                        "number"
                    },


                    currency: {

                      type:
                        "string"
                    },


                    marketId: {

                      type:
                        "string"
                    }
                  }
                }
              }
            }
          }
        }
      },


      required: [

        "shoppingCountry",

        "products"
      ]
    },


    execute:
      async function(input) {

        return JSON.stringify(
          await gtCompareMarketPrices(
            input
          )
        );
      }
  });


  console.info(
    "[GodreryTone WebMCP] Market-aware pricing logic registered successfully."
  );


} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Market-aware pricing logic registration failed:",
    error
  );
}
/* =========================================================
   GODRERYTONE SHIPPING ELIGIBILITY TOOL
   ========================================================= */

try {
  document.modelContext.registerTool({
      name: "godrerytone_shipping_eligibility",

      description:
        "Determine whether a specific GodreryTone jewellery product can be shipped to the customer's delivery country using the shipping rules applicable to the internal market determined by the customer's shopping country. The market is an internal commerce mechanism and must not be exposed to the customer. The applicable market determines the product/catalogue context and shipping rules. Verify the actual product, shopping country, applicable market, delivery country, shipping eligibility, shipping type, shipping fee, and applicable shipping conditions through the existing GodreryTone commerce data layer. Never assume that a product available in one market can be shipped under another market's rules, and never assume that shipping is free unless verified.",

      inputSchema: {
        type: "object",

        properties: {

          productHandle: {
            type: "string",
            description:
              "The Shopify product handle or unique product identifier, when available."
          },

          productTitle: {
            type: "string",
            description:
              "The product name the customer wants to purchase."
          },

          shoppingCountry: {
            type: "string",
            description:
              "The customer's shopping country. This country is used internally to determine the applicable GodreryTone market."
          },

          deliveryCountry: {
            type: "string",
            description:
              "The country where the customer wants the selected product delivered."
          },

          deliveryRegion: {
            type: "string",
            description:
              "State, province, region, or locality of delivery when relevant."
          },

          productOrigin: {
            type: "string",
            description:
              "Known product origin when explicitly available. Product origin is contextual information and must not independently determine the customer's shipping market or shipping eligibility."
          },

          regionalAlternativeAvailable: {
            type: "boolean",
            description:
              "Whether a regional or neighbouring-country alternative has already been identified by the regional market process. This tool does not independently search for regional alternatives."
          },

          neighbouringCountryOption: {
            type: "string",
            description:
              "A neighbouring or regional country already identified as an alternative, when applicable. This tool does not independently select or switch to that country."
          },

          customerConsentRequired: {
            type: "boolean",
            description:
              "Whether the customer must explicitly decide whether to proceed because the shipping path or regional option requires a customer decision."
          }

        },

        required: [
          "productTitle",
          "shoppingCountry",
          "deliveryCountry"
        ]
      },

      execute: async function (input) {

        function clean(value) {
          if (
            value === undefined ||
            value === null ||
            value === ""
          ) {
            return null;
          }

          return value;
        }

        function cleanString(value) {
          var cleaned = clean(value);

          if (cleaned === null) {
            return null;
          }

          return String(cleaned).trim();
        }

        function normalizeCountry(value) {
          var country = cleanString(value);

          if (!country) {
            return null;
          }

          return country.toUpperCase();
        }

        function getDataLayer() {
          if (
            window.GodreryToneWebMCP &&
            window.GodreryToneWebMCP.data
          ) {
            return window.GodreryToneWebMCP.data;
          }

          return null;
        }

        function getRegistry() {
          if (
            window.GodreryToneWebMCP &&
            window.GodreryToneWebMCP.registry
          ) {
            return window.GodreryToneWebMCP.registry;
          }

          return null;
        }

        function normalizeResultStatus(value) {
          if (!value) {
            return "unknown";
          }

          var status = String(value).toLowerCase();

          if (
            status === "eligible" ||
            status === "eligible_with_fee" ||
            status === "conditional" ||
            status === "regional_only" ||
            status === "not_eligible" ||
            status === "unknown"
          ) {
            return status;
          }

          return "unknown";
        }

        function normalizeShippingType(value) {
          if (!value) {
            return "unknown";
          }

          var type = String(value).toLowerCase();

          if (
            type === "free" ||
            type === "paid" ||
            type === "conditional" ||
            type === "unknown"
          ) {
            return type;
          }

          return "unknown";
        }

        function getObjectValue(object, keys) {
          if (!object || !Array.isArray(keys)) {
            return null;
          }

          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (
              object[key] !== undefined &&
              object[key] !== null &&
              object[key] !== ""
            ) {
              return object[key];
            }
          }

          return null;
        }

        var shoppingCountry =
          normalizeCountry(input.shoppingCountry);

        var deliveryCountry =
          normalizeCountry(input.deliveryCountry);

        var productHandle =
          cleanString(input.productHandle);

        var productTitle =
          cleanString(input.productTitle);

        var deliveryRegion =
          cleanString(input.deliveryRegion);

        var data =
          getDataLayer();

        var registry =
          getRegistry();

        var marketResolutionStatus =
          "unknown";

        var marketId =
          null;

        var marketData =
          null;

        var productData =
          null;

        var shippingResolution =
          null;

        var destinationResolution =
          null;

        /*
         * ---------------------------------------------------------
         * STEP 1
         * Resolve the customer's shopping country to its
         * internal market.
         *
         * The market is internal and must never be exposed
         * as a customer-facing identity.
         * ---------------------------------------------------------
         */

        if (
          shoppingCountry &&
          registry &&
          registry.markets &&
          registry.marketCountryAssignments
        ) {

          var marketIds =
            Object.keys(registry.markets);

          for (
            var marketIndex = 0;
            marketIndex < marketIds.length;
            marketIndex++
          ) {

            var currentMarketId =
              marketIds[marketIndex];

            var assignedCountries =
              registry.marketCountryAssignments[
                currentMarketId
              ];

            if (!Array.isArray(assignedCountries)) {
              continue;
            }

            for (
              var countryIndex = 0;
              countryIndex < assignedCountries.length;
              countryIndex++
            ) {

              if (
                normalizeCountry(
                  assignedCountries[countryIndex]
                ) === shoppingCountry
              ) {

                marketId =
                  currentMarketId;

                marketResolutionStatus =
                  "resolved";

                break;
              }
            }

            if (marketId) {
              break;
            }
          }
        }

        /*
         * ---------------------------------------------------------
         * STEP 2
         * Obtain current market data through Bit 1B.
         * ---------------------------------------------------------
         */

        if (
          marketId &&
          data &&
          typeof data.getMarket === "function"
        ) {

          try {

            marketData =
              await data.getMarket(marketId);

          } catch (error) {

            marketData =
              null;
          }
        }

        /*
         * ---------------------------------------------------------
         * STEP 3
         * Obtain the actual selected product through Bit 1B.
         *
         * The product must be resolved in the customer's
         * applicable market context where the available data
         * layer supports that resolution.
         * ---------------------------------------------------------
         */

        if (
          data &&
          typeof data.getProduct === "function"
        ) {

          try {

            if (productHandle) {

              productData =
                await data.getProduct(
                  productHandle
                );

            }

          } catch (error) {

            productData =
              null;
          }
        }

        /*
         * ---------------------------------------------------------
         * STEP 4
         * Resolve product destination using the existing
         * Bit 1B resolution layer.
         *
         * This keeps shipping logic centralized instead of
         * recreating vendor/product eligibility rules here.
         * ---------------------------------------------------------
         */

        if (
          productData &&
          deliveryCountry &&
          data &&
          typeof data.resolveProductDestination === "function"
        ) {

          try {

            destinationResolution =
              await data.resolveProductDestination(
                productData,
                deliveryCountry
              );

          } catch (error) {

            destinationResolution =
              null;
          }
        }

        /*
         * ---------------------------------------------------------
         * STEP 5
         * Resolve shipping using the existing Bit 1B
         * shipping resolution.
         *
         * The selected product and requested destination are
         * passed to the existing commerce resolution layer.
         * ---------------------------------------------------------
         */

        if (
          productData &&
          deliveryCountry &&
          data &&
          typeof data.resolveShipping === "function"
        ) {

          try {

            shippingResolution =
              await data.resolveShipping(
                productData,
                deliveryCountry
              );

          } catch (error) {

            shippingResolution =
              null;
          }
        }

        /*
         * ---------------------------------------------------------
         * STEP 6
         * Extract only verified shipping information.
         *
         * The tool never trusts customer/model supplied values
         * such as shippingFee, shippingType, or eligibility.
         * ---------------------------------------------------------
         */

        var resolvedEligibility =
          normalizeResultStatus(
            getObjectValue(
              shippingResolution,
              [
                "eligibility",
                "status"
              ]
            )
          );

        if (
          resolvedEligibility === "unknown" &&
          destinationResolution
        ) {

          resolvedEligibility =
            normalizeResultStatus(
              getObjectValue(
                destinationResolution,
                [
                  "eligibility",
                  "status"
                ]
              )
            );
        }

        var resolvedShippingType =
          normalizeShippingType(
            getObjectValue(
              shippingResolution,
              [
                "shippingType",
                "type"
              ]
            )
          );

        var resolvedShippingFee =
          getObjectValue(
            shippingResolution,
            [
              "shippingFee",
              "fee"
            ]
          );

        var resolvedShippingCurrency =
          cleanString(
            getObjectValue(
              shippingResolution,
              [
                "shippingCurrency",
                "currency"
              ]
            )
          );

        var resolvedShippingCondition =
          cleanString(
            getObjectValue(
              shippingResolution,
              [
                "shippingCondition",
                "condition",
                "shippingTerms"
              ]
            )
          );

        /*
         * ---------------------------------------------------------
         * STEP 7
         * If Bit 1's shipping result exists, preserve its
         * verified result.
         * ---------------------------------------------------------
         */

        if (
          shippingResolution &&
          shippingResolution.shipping
        ) {

          var resolvedShipping =
            shippingResolution.shipping;

          if (
            resolvedShippingType === "unknown"
          ) {

            resolvedShippingType =
              normalizeShippingType(
                getObjectValue(
                  resolvedShipping,
                  [
                    "shippingType",
                    "type"
                  ]
                )
              );
          }

          if (
            resolvedShippingFee === null ||
            resolvedShippingFee === undefined
          ) {

            resolvedShippingFee =
              getObjectValue(
                resolvedShipping,
                [
                  "shippingFee",
                  "fee"
                ]
              );
          }

          if (!resolvedShippingCurrency) {

            resolvedShippingCurrency =
              cleanString(
                getObjectValue(
                  resolvedShipping,
                  [
                    "shippingCurrency",
                    "currency"
                  ]
                )
              );
          }

          if (!resolvedShippingCondition) {

            resolvedShippingCondition =
              cleanString(
                getObjectValue(
                  resolvedShipping,
                  [
                    "shippingCondition",
                    "condition",
                    "terms"
                  ]
                )
              );
          }
        }

        /*
         * ---------------------------------------------------------
         * STEP 8
         * Determine whether a verified shipping fee exists.
         * ---------------------------------------------------------
         */

        var hasShippingFee =
          resolvedShippingFee !== null &&
          resolvedShippingFee !== undefined;

        if (
          resolvedShippingType === "paid"
        ) {

          hasShippingFee = true;
        }

        /*
         * ---------------------------------------------------------
         * STEP 9
         * Customer decision logic.
         *
         * Regional alternatives are not discovered here.
         * If another tool has already identified one, this tool
         * can preserve that fact without automatically switching
         * the customer's shopping market or delivery country.
         * ---------------------------------------------------------
         */

        var regionalAlternativeAvailable =
          input.regionalAlternativeAvailable === true;

        var customerConsentRequired =
          input.customerConsentRequired === true;

        if (
          resolvedEligibility === "conditional" ||
          resolvedEligibility === "regional_only"
        ) {

          customerConsentRequired =
            true;
        }

        /*
         * ---------------------------------------------------------
         * STEP 10
         * Build customer-safe result.
         *
         * IMPORTANT:
         * The internal market ID/name is deliberately NOT
         * returned as customer-facing information.
         * ---------------------------------------------------------
         */

        return JSON.stringify({

          success: true,

          brand:
            "GodreryTone",

          shippingEligibility: {

            productHandle:
              productHandle,

            productTitle:
              productTitle,

            productOrigin:
              cleanString(input.productOrigin),

            shoppingCountry:
              shoppingCountry,

            deliveryCountry:
              deliveryCountry,

            deliveryRegion:
              deliveryRegion,

            marketResolution:
              marketResolutionStatus,

            eligibility:
              resolvedEligibility,

            shippingType:
              resolvedShippingType,

            shippingFee:
              hasShippingFee
                ? resolvedShippingFee
                : null,

            shippingCurrency:
              resolvedShippingCurrency,

            hasShippingFee:
              hasShippingFee,

            shippingCondition:
              resolvedShippingCondition,

            regionalAlternativeAvailable:
              regionalAlternativeAvailable,

            neighbouringCountryOption:
              cleanString(
                input.neighbouringCountryOption
              ),

            customerConsentRequired:
              customerConsentRequired

          },

          shippingRules: [

            "Determine the customer's shopping country before resolving shipping eligibility.",

            "Use the customer's shopping country to resolve the internal GodreryTone market.",

            "The internal market determines the applicable commerce and shipping context.",

            "The internal market name or identifier must never be exposed to the customer.",

            "The product must be evaluated in the catalogue context applicable to the customer's shopping country.",

            "Do not use the global catalogue as a substitute for the customer's market-specific product availability.",

            "A product existing somewhere in the GodreryTone catalogue does not mean that it is available through every market.",

            "A product being available through the applicable market does not automatically mean that it can be delivered to every destination country.",

            "Apply the shipping rules belonging to the customer's applicable market.",

            "Evaluate the selected product together with the applicable market shipping rules and requested delivery country.",

            "Do not use product origin alone to determine shipping eligibility.",

            "Do not assume that products made in Kenya automatically have the same shipping conditions for every market or destination.",

            "Do not assume that shipping is free unless the applicable shipping information has been verified.",

            "If shipping is paid, report the verified shipping fee separately from the product price.",

            "If the shipping fee is unknown, do not invent, estimate, or assume a fee.",

            "If shipping is conditional, explain the verified condition before presenting a final purchase path.",

            "Do not silently change the customer's shopping country.",

            "Do not silently change the customer's delivery country.",

            "Do not silently switch the customer to another market.",

            "Do not independently search for regional alternatives.",

            "Regional or neighbouring-country alternatives are handled by the Regional Market tool.",

            "If a regional alternative has already been identified, treat it as an alternative path and do not automatically select it.",

            "Customer permission to consider a regional alternative does not automatically mean consent to purchase a specific regional product.",

            "If a regional purchase path has different shipping conditions, those conditions must be verified separately.",

            "Only present shipping information that can be verified from the current GodreryTone commerce data.",

            "Keep internal supplier, vendor, market, and commerce-resolution identifiers out of customer-facing responses."

          ],

          agentGuidance: {

            normalCase:
              "If the selected product is verified as eligible for the requested delivery country under the applicable shopping market's shipping rules, present the verified shipping condition to the customer.",

            freeShippingCase:
              "If the applicable market's verified shipping information states that shipping is free, tell the customer that shipping is free. Do not assume free shipping merely because GodreryTone generally offers free shipping.",

            paidShippingCase:
              "If the product is eligible but the applicable market's verified shipping rules require a fee, show the product price and verified shipping fee separately.",

            conditionalCase:
              "If shipping depends on a verified condition, explain the condition clearly and obtain the customer's decision when required.",

            regionalOnlyCase:
              "If the selected product is not directly eligible for the requested destination but a regional alternative has already been identified, preserve the regional alternative as a separate option and require customer consent before treating it as the customer's purchase path.",

            unavailableCase:
              "If the product cannot be shipped to the requested destination under the applicable market's shipping rules, do not present it as directly purchasable for that destination.",

            unknownCase:
              "If the applicable market, product, destination eligibility, shipping cost, or shipping conditions cannot be verified, report the information as unknown and do not invent a shipping result.",

            marketVisibility:
              "Use the internal market to resolve the customer's applicable shipping rules, but never expose the internal market name or identifier to the customer."

          },

          nextStep:
            "Use the verified shipping result together with the selected market-specific product and applicable customer-facing commerce terms to determine the customer's actual purchase path."

        });
      }

  });

  console.info(
    "[GodreryTone WebMCP] shipping eligibility tool registered successfully."
  );

} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Shipping eligibility tool registration failed:",
    error
  );

}/* =========================================================
   GODRERYTONE #11
   CUSTOMER DECISION / PURCHASE-PATH LOGIC
   ========================================================= */

function gtCustomerPurchaseDecision(input) {

  function clean(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    return value;
  }

  function cleanArray(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(function(item) {
      return item !== undefined && item !== null;
    });
  }

  function cleanString(value) {
    var result = clean(value);

    if (result === null) {
      return null;
    }

    return String(result).trim() || null;
  }

  function normalizeNumber(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    var number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  }

  var product =
    input.product || {};

  var shipping =
    input.shipping || {};

  var pricing =
    input.pricing || {};

  var requestedMarket =
    cleanString(input.shoppingCountry);

  var deliveryCountry =
    cleanString(input.deliveryCountry);

  var customerAskedToProceed =
    input.customerConfirmed === true;

  var regionalSearch =
    input.regionalSearch === true;

  var productTitle =
    cleanString(product.title);

  /*
   * ---------------------------------------------------------
   * ORIGINAL PRODUCT PRICE
   *
   * This is the supplied catalogue/backend price.
   *
   * Purchase Decision does NOT convert this value.
   * ---------------------------------------------------------
   */

  var productPrice =
    normalizeNumber(product.price);

  var productCurrency =
    cleanString(product.currency);

  /*
   * ---------------------------------------------------------
   * CUSTOMER-FACING PRICE VERIFICATION
   *
   * Currency conversion is performed by the shared Bit 1B
   * FX infrastructure and consumed by Market-Aware Pricing #9.
   *
   * This tool does NOT perform currency math.
   *
   * It only verifies that #9 supplied a customer-facing
   * converted price that is explicitly marked verified
   * and ready for presentation.
   * ---------------------------------------------------------
   */

  var customerCurrency =
    cleanString(
      pricing.customerCurrency
    );

  /*
   * Primary supported field from #9.
   */
  var convertedProductPrice =
    normalizeNumber(
      pricing.convertedProductPrice
    );

  /*
   * Support the richer customerPrice structure that #9
   * may return.
   *
   * Example:
   *
   * customerPrice: {
   *   amount,
   *   currency,
   *   exchangeRate,
   *   exchangeRateTimestamp,
   *   exchangeRateSource,
   *   verified
   * }
   */

  var customerPrice =
    pricing.customerPrice &&
    typeof pricing.customerPrice === "object"
      ? pricing.customerPrice
      : null;

  if (
    convertedProductPrice === null &&
    customerPrice
  ) {
    convertedProductPrice =
      normalizeNumber(
        customerPrice.amount
      );
  }

  /*
   * Prefer the explicit pricing customer currency.
   * If absent, accept the currency attached to the
   * verified customerPrice object.
   */

  if (
    customerCurrency === null &&
    customerPrice
  ) {
    customerCurrency =
      cleanString(
        customerPrice.currency
      );
  }

  /*
   * Conversion verification can come from the explicit
   * #9 field or the verified customerPrice object.
   */

  var priceConversionVerified =
    pricing.priceConversionVerified === true ||
    (
      customerPrice &&
      customerPrice.verified === true
    );

  /*
   * Explicit presentation-ready flag from #9.
   */

  var pricePresentationReady =
    pricing.pricePresentationReady === true;

  /*
   * Exchange-rate metadata is informational here.
   *
   * #11 does NOT calculate or alter the converted price.
   */

  var exchangeRate =
    normalizeNumber(
      pricing.exchangeRate
    );

  if (
    exchangeRate === null &&
    customerPrice
  ) {
    exchangeRate =
      normalizeNumber(
        customerPrice.exchangeRate
      );
  }

  var exchangeRateTimestamp =
    cleanString(
      pricing.exchangeRateTimestamp
    );

  if (
    exchangeRateTimestamp === null &&
    customerPrice
  ) {
    exchangeRateTimestamp =
      cleanString(
        customerPrice.exchangeRateTimestamp
      );
  }

  var exchangeRateSource =
    cleanString(
      pricing.exchangeRateSource
    );

  if (
    exchangeRateSource === null &&
    customerPrice
  ) {
    exchangeRateSource =
      cleanString(
        customerPrice.exchangeRateSource
      );
  }

  /*
   * A customer-facing price is only considered ready when:
   *
   * 1. customer currency is known
   * 2. converted price exists
   * 3. conversion has been verified
   * 4. price presentation has explicitly been marked ready
   *
   * #11 does not perform conversion.
   */

  var customerPriceReady =
    customerCurrency !== null &&
    convertedProductPrice !== null &&
    priceConversionVerified &&
    pricePresentationReady;

  /*
   * ---------------------------------------------------------
   * SHIPPING
   * ---------------------------------------------------------
   */

  var shippingEligibility =
    clean(
      shipping.eligibility
    ) || "unknown";

  var shippingType =
    clean(
      shipping.shippingType
    ) || "unknown";

  var shippingFee =
    normalizeNumber(
      shipping.shippingFee
    );

  var shippingCurrency =
    cleanString(
      shipping.shippingCurrency
    );

  /*
   * A paid shipping result is only fully usable when
   * the actual fee is known.
   */

  var shippingFeeKnown =
    shippingFee !== null;

  /*
   * ---------------------------------------------------------
   * REGIONAL PRICING
   * ---------------------------------------------------------
   */

  var cheaperRegionalOption =
    pricing.cheaperRegionalOptionExists === true;

  var regionalOptions =
    cleanArray(
      pricing.cheaperRegionalOptions
    );

  /*
   * ---------------------------------------------------------
   * REGIONAL CUSTOMER ACCEPTANCE
   * ---------------------------------------------------------
   */

  var regionalOptionAccepted =
    input.customerAcceptedRegionalOption === true;

  var regionalShippingAccepted =
    input.customerAcceptedRegionalShipping === true;

  /*
   * ---------------------------------------------------------
   * PURCHASE DECISION STATE
   * ---------------------------------------------------------
   */

  var requiresCustomerDecision =
    false;

  var purchasePath =
    "review_required";

  var reason = [];

  /*
   * ---------------------------------------------------------
   * CASE 1:
   * CUSTOMER-FACING PRICE IS NOT READY
   *
   * This must happen before normal purchase confirmation.
   * ---------------------------------------------------------
   */

  if (!customerPriceReady) {

    requiresCustomerDecision = false;

    purchasePath =
      "price_conversion_required";

    reason.push(
      "The product price has not yet been verified as converted into the customer's currency for presentation."
    );

  }

  /*
   * ---------------------------------------------------------
   * CASE 2:
   * PRODUCT CANNOT BE VERIFIED FOR SHIPPING
   * ---------------------------------------------------------
   */

  else if (
    shippingEligibility === "unknown"
  ) {

    requiresCustomerDecision = false;

    purchasePath =
      "shipping_verification_required";

    reason.push(
      "Shipping eligibility has not been verified for the destination."
    );

  }

  /*
   * ---------------------------------------------------------
   * CASE 3:
   * PRODUCT CANNOT SHIP DIRECTLY TO DESTINATION
   * ---------------------------------------------------------
   */

  else if (
    shippingEligibility === "not_eligible"
  ) {

    if (
      regionalOptions.length > 0 &&
      regionalSearch
    ) {

      requiresCustomerDecision = true;

      purchasePath =
        "regional_option_requires_customer_choice";

      reason.push(
        "The product is not eligible for direct delivery to the requested destination."
      );

      reason.push(
        "A permitted regional alternative may be available."
      );

    } else {

      requiresCustomerDecision = false;

      purchasePath =
        "cannot_proceed";

      reason.push(
        "The product cannot be shipped to the requested destination."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * CASE 4:
   * REGIONAL-ONLY SHIPPING
   * ---------------------------------------------------------
   */

  else if (
    shippingEligibility === "regional_only"
  ) {

    if (
      !regionalOptionAccepted ||
      !regionalShippingAccepted
    ) {

      requiresCustomerDecision = true;

      purchasePath =
        "regional_shipping_choice";

      reason.push(
        "The product requires a regional or neighbouring-country shipping arrangement."
      );

      reason.push(
        "Customer confirmation is required before proceeding."
      );

    } else {

      requiresCustomerDecision = true;

      purchasePath =
        "normal_purchase_confirmation";

      reason.push(
        "The customer has accepted the regional purchase and shipping arrangement."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * CASE 5:
   * CONDITIONAL SHIPPING
   * ---------------------------------------------------------
   */

  else if (
    shippingEligibility === "conditional"
  ) {

    requiresCustomerDecision = true;

    purchasePath =
      "conditional_shipping_choice";

    reason.push(
      "Shipping is subject to additional conditions."
    );

    reason.push(
      "The customer must decide whether to continue."
    );

  }

  /*
   * ---------------------------------------------------------
   * CASE 6:
   * ELIGIBLE WITH SHIPPING FEE
   * ---------------------------------------------------------
   */

  else if (
    shippingEligibility === "eligible_with_fee" ||
    shippingType === "paid"
  ) {

    if (!shippingFeeKnown) {

      requiresCustomerDecision = false;

      purchasePath =
        "shipping_verification_required";

      reason.push(
        "The product can potentially be shipped, but the shipping fee has not been verified."
      );

    } else {

      /*
       * A known shipping fee does not itself require a
       * special market decision.
       *
       * The fee is simply presented separately.
       */

      if (
        cheaperRegionalOption &&
        regionalSearch
      ) {

        requiresCustomerDecision = true;

        purchasePath =
          "compare_market_options";

        reason.push(
          "The requested market has a viable product option with a verified shipping fee."
        );

        reason.push(
          "A cheaper regional market option may also exist."
        );

      } else {

        requiresCustomerDecision = true;

        purchasePath =
          "normal_purchase_confirmation";

        reason.push(
          "The product is eligible for the requested destination."
        );

        reason.push(
          "The shipping fee has been verified and must be shown separately from the product price."
        );
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * CASE 7:
   * NORMAL / FREE SHIPPING
   * ---------------------------------------------------------
   */

  else if (
    shippingEligibility === "eligible"
  ) {

    if (
      cheaperRegionalOption &&
      regionalSearch
    ) {

      requiresCustomerDecision = true;

      purchasePath =
        "compare_market_options";

      reason.push(
        "The requested market has a viable product option."
      );

      reason.push(
        "A cheaper regional market option may also exist."
      );

    } else {

      requiresCustomerDecision = true;

      purchasePath =
        "normal_purchase_confirmation";

      reason.push(
        "The product is eligible for the requested destination."
      );
    }

  }

  /*
   * ---------------------------------------------------------
   * CUSTOMER CONFIRMATION
   * ---------------------------------------------------------
   */

  var customerAction;

  if (
    purchasePath ===
      "price_conversion_required"
  ) {

    customerAction =
      "Complete and verify conversion of the product price into the customer's currency before presenting the product as a confirmed purchase option.";

  } else if (
    purchasePath ===
      "shipping_verification_required"
  ) {

    customerAction =
      "Verify shipping eligibility and required shipping information before presenting the product as a confirmed purchase option.";

  } else if (
    customerAskedToProceed &&
    purchasePath !== "cannot_proceed"
  ) {

    customerAction =
      "Customer has explicitly confirmed that they want to proceed with the presented purchase path.";

  } else if (
    requiresCustomerDecision
  ) {

    customerAction =
      "Ask the customer whether they want to proceed with the presented option.";

  } else {

    customerAction =
      "Do not present the product as directly purchasable for the requested destination.";
  }

  /*
   * ---------------------------------------------------------
   * MARKET PROTECTION
   * ---------------------------------------------------------
   */

  var marketProtection = {

    selectedMarket:
      requestedMarket,

    deliveryCountry:
      deliveryCountry,

    neverSilentlyChangeMarket:
      true,

    neverApplyRegionalPriceToPrimaryMarket:
      true,

    requireCustomerChoiceForRegionalOption:
      true,

    compareShippingBeforeRegionalPurchase:
      true

  };

  /*
   * ---------------------------------------------------------
   * PRICE PRESENTATION PROTECTION
   * ---------------------------------------------------------
   *
   * #11 only validates the result supplied by the pricing
   * layer. It does not perform FX conversion.
   * ---------------------------------------------------------
   */

  var pricePresentation = {

    ready:
      customerPriceReady,

    customerCurrency:
      customerCurrency,

    convertedProductPrice:
      customerPriceReady
        ? convertedProductPrice
        : null,

    conversionVerified:
      priceConversionVerified,

    presentationReady:
      pricePresentationReady,

    exchangeRate:
      customerPriceReady
        ? exchangeRate
        : null,

    exchangeRateTimestamp:
      customerPriceReady
        ? exchangeRateTimestamp
        : null,

    exchangeRateSource:
      customerPriceReady
        ? exchangeRateSource
        : null,

    rule:
      "The product price must be converted through the shared verified FX infrastructure and explicitly verified before it is presented as the confirmed customer-facing price."

  };

  /*
   * ---------------------------------------------------------
   * BUILD RESULT
   * ---------------------------------------------------------
   */

  return {

    success: true,

    brand:
      "GodreryTone",

    customerDecision: {

      productTitle:
        productTitle,

      /*
       * Original catalogue/backend price.
       *
       * This remains untouched and is not replaced by
       * the customer-currency presentation price.
       */

      productPrice:
        productPrice,

      productCurrency:
        productCurrency,

      /*
       * Customer-facing converted price.
       *
       * Only exposed as ready when the conversion supplied
       * by the pricing layer has been verified.
       */

      customerCurrency:
        customerCurrency,

      convertedProductPrice:
        customerPriceReady
          ? convertedProductPrice
          : null,

      pricePresentationReady:
        customerPriceReady,

      /*
       * FX verification metadata.
       *
       * Informational only. #11 performs no FX math.
       */

      priceConversionVerified:
        priceConversionVerified,

      exchangeRate:
        customerPriceReady
          ? exchangeRate
          : null,

      exchangeRateTimestamp:
        customerPriceReady
          ? exchangeRateTimestamp
          : null,

      exchangeRateSource:
        customerPriceReady
          ? exchangeRateSource
          : null,

      shoppingCountry:
        requestedMarket,

      deliveryCountry:
        deliveryCountry,

      shippingEligibility:
        shippingEligibility,

      shippingType:
        shippingType,

      shippingFee:
        shippingFee,

      shippingCurrency:
        shippingCurrency,

      regionalOptionAvailable:
        cheaperRegionalOption,

      regionalOptions:
        regionalOptions,

      purchasePath:
        purchasePath,

      requiresCustomerDecision:
        requiresCustomerDecision,

      customerConfirmed:
        customerAskedToProceed,

      customerAction:
        customerAction,

      reason:
        reason

    },

    pricePresentation:
      pricePresentation,

    marketProtection:
      marketProtection,

    conversationRules: [

      "The customer must remain in control of the purchase decision.",

      "The product price must be converted into the customer's currency before it is presented as the confirmed customer-facing price.",

      "Price conversion must be verified before pricePresentationReady can be true.",

      "Purchase Decision does not perform currency conversion or currency math.",

      "Budget #7 owns normalization of the customer's budget into USD.",

      "Market-Aware Pricing #9 uses Bit 1B shared verified FX infrastructure to convert verified USD market prices into the customer's preferred currency for customer-facing presentation.",

      "Purchase Decision #11 verifies that the customer-facing converted price supplied by the pricing layer is ready.",

      "Do not present an unconverted USD price as the customer's confirmed local-currency price when another customer currency has been established.",

      "Do not invent, estimate, multiply, divide, or otherwise independently calculate an exchange rate.",

      "Do not replace the original verified market price with the converted customer-facing presentation price.",

      "Never automatically choose a different market because it has a lower price.",

      "Never automatically select a neighbouring country.",

      "Never silently change the customer's delivery country.",

      "Never silently change the customer's shopping market.",

      "Present the customer's selected market option first.",

      "If a different market is cheaper, clearly identify that the price belongs to the different market.",

      "A cheaper regional price does not automatically apply to the customer's selected market.",

      "Verify shipping eligibility before presenting a regional option as a viable purchase path.",

      "If regional shipping conditions differ, explain the difference before asking the customer to proceed.",

      "If a product has a shipping fee, show the shipping fee separately from the product price.",

      "Do not claim that shipping is free unless free shipping has been verified for the actual product and destination.",

      "If shipping eligibility is unknown, verify it rather than guessing.",

      "If the product cannot ship to the customer's destination, do not represent it as directly purchasable.",

      "When a customer decision is required, ask the customer explicitly whether they want to continue.",

      "Only treat the customer as having chosen a regional alternative after the customer explicitly agrees.",

      "Internal market identifiers and supplier/vendor information must not be exposed to the customer."

    ],

    responseGuidance: {

      normalPurchase:
        "Present the product using the verified customer-facing converted price, the applicable market conditions, and the verified shipping condition. Then ask whether the customer wants to proceed.",

      priceConversionRequired:
        "Do not present the product price as a confirmed customer-facing price until Market-Aware Pricing has obtained a verified customer-currency conversion through the shared Bit 1B FX infrastructure and marked the presentation ready.",

      cheaperRegionalOption:
        "Explain that the regional market has a different listed price, identify the regional market appropriately for the customer, explain its shipping condition, and ask whether the customer wants to explore or proceed with that option.",

      shippingFee:
        "Clearly state that the product has a shipping fee and present that fee separately from the converted product price before asking whether the customer wants to continue.",

      regionalOnly:
        "Explain that direct delivery to the customer's requested destination is unavailable and that a regional or neighbouring-country option may exist. Ask the customer whether they want to continue.",

      unavailable:
        "Explain that the product cannot currently be shipped to the requested destination and do not create a false purchase path.",

      unknown:
        "Explain that the required shipping information needs to be verified before the product can be presented as a confirmed purchase option."

    },

    nextStep:
      "Only proceed with a normal purchase path when the customer-facing converted price is verified, the product is valid for the applicable catalogue, and shipping conditions are sufficiently verified. Otherwise resolve the outstanding condition or ask the customer for the required decision."

  };
}


/* =========================================================
   REGISTER CUSTOMER DECISION LOGIC
   ========================================================= */

try {

  document.modelContext.registerTool({

    name:
      "godrerytone_customer_purchase_decision",

    description:
      "Manage the customer's purchase decision after product, market, pricing, currency conversion, and shipping information has been evaluated. The tool verifies that the product price supplied by the pricing layer has been converted through the shared verified FX infrastructure into the customer's currency and is ready for customer-facing presentation before allowing a normal purchase path. The tool does not perform currency conversion itself. The customer remains in control and the tool never silently changes the shopping market, delivery country, product price, regional market, or shipping conditions.",

    inputSchema: {

      type: "object",

      properties: {

        shoppingCountry: {
          type: "string",
          description:
            "The customer's shopping country used to establish the applicable internal market."
        },

        deliveryCountry: {
          type: "string",
          description:
            "The customer's requested delivery country."
        },

        regionalSearch: {
          type: "boolean",
          description:
            "Whether the customer has permitted regional or neighbouring-market consideration."
        },

        customerConfirmed: {
          type: "boolean",
          description:
            "Whether the customer has explicitly confirmed that they want to proceed with the presented purchase path."
        },

        customerAcceptedRegionalOption: {
          type: "boolean",
          description:
            "Whether the customer has explicitly accepted the specific regional product or market option."
        },

        customerAcceptedRegionalShipping: {
          type: "boolean",
          description:
            "Whether the customer has explicitly accepted the regional shipping arrangement when different from the primary-market arrangement."
        },

        product: {

          type: "object",

          properties: {

            handle: {
              type: "string"
            },

            title: {
              type: "string"
            },

            price: {
              type: "number",
              description:
                "Verified catalogue/backend product price."
            },

            currency: {
              type: "string",
              description:
                "Currency of the supplied catalogue/backend product price."
            },

            productAvailable: {
              type: "boolean"
            }

          }

        },

        shipping: {

          type: "object",

          properties: {

            eligibility: {
              type: "string"
            },

            shippingType: {
              type: "string"
            },

            shippingFee: {
              type: "number"
            },

            shippingCurrency: {
              type: "string"
            }

          }

        },

        pricing: {

          type: "object",

          properties: {

            cheaperRegionalOptionExists: {
              type: "boolean"
            },

            cheaperRegionalOptions: {
              type: "array"
            },

            customerCurrency: {
              type: "string",
              description:
                "Customer's currency into which Market-Aware Pricing has converted the verified USD product price."
            },

            convertedProductPrice: {
              type: "number",
              description:
                "Verified product price converted into the customer's currency by the shared Bit 1B FX infrastructure."
            },

            customerPrice: {
              type: "object",
              description:
                "Optional richer verified customer-facing price object supplied by Market-Aware Pricing #9.",
              properties: {

                amount: {
                  type: "number"
                },

                currency: {
                  type: "string"
                },

                exchangeRate: {
                  type: "number"
                },

                exchangeRateTimestamp: {
                  type: "string"
                },

                exchangeRateSource: {
                  type: "string"
                },

                verified: {
                  type: "boolean"
                }

              }
            },

            exchangeRate: {
              type: "number",
              description:
                "Verified exchange rate supplied by the shared FX infrastructure. #11 does not calculate this rate."
            },

            exchangeRateTimestamp: {
              type: "string",
              description:
                "Timestamp of the verified exchange rate used by the pricing layer."
            },

            exchangeRateSource: {
              type: "string",
              description:
                "Source identifier for the verified exchange rate supplied by the shared FX infrastructure."
            },

            priceConversionVerified: {
              type: "boolean",
              description:
                "Whether the customer-currency price conversion supplied by the pricing layer has been verified."
            },

            pricePresentationReady: {
              type: "boolean",
              description:
                "Whether the converted product price is explicitly verified as ready for customer-facing presentation."
            }

          }

        }

      },

      required: [

        "shoppingCountry",

        "deliveryCountry"

      ]

    },

    execute: async function(input) {

      return JSON.stringify(
        gtCustomerPurchaseDecision(input)
      );

    }

  });

  console.info(
    "[GodreryTone WebMCP] Customer decision logic registered successfully."
  );

} catch (error) {

  console.error(
    "[GodreryTone WebMCP] Customer decision logic registration failed:",
    error
  );

}
    /* 
 * =========================================================
 * GODRERYTONE WEBMCP — #12 FINAL INTEGRATION LOGIC
 * =========================================================
 */

window.GodreryToneWebMCP =
  window.GodreryToneWebMCP || {};

var GT = window.GodreryToneWebMCP;


/* 
 * =========================================================
 * FINAL INTEGRATION
 * =========================================================
 */

GT.finalIntegration = function (input) {

  input = input || {};

  function clean(value) {

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    return value;
  }

  function cleanString(value) {

    var result = clean(value);

    if (result === null) {
      return null;
    }

    return String(result).trim() || null;
  }

  function cleanArray(value) {

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(function (item) {
      return item !== undefined && item !== null;
    });
  }

  function validNumber(value) {

    return (
      typeof value === "number" &&
      Number.isFinite(value)
    );
  }

  /*
   * ---------------------------------------------------------
   * CUSTOMER REQUEST
   * ---------------------------------------------------------
   */

  var shoppingCountry =
    cleanString(input.shoppingCountry);

  var deliveryCountry =
    cleanString(input.deliveryCountry);


  /*
   * ---------------------------------------------------------
   * PRODUCT / CATALOGUE RESULT
   * ---------------------------------------------------------
   *
   * #8 owns catalogue discovery and availability.
   * #12 only consumes its verified result.
   */

  var productAvailable =
    input.productAvailable === true;

  var productAvailableInRequestedMarket =
    input.productAvailableInRequestedMarket === true;

  /*
   * Preserve compatibility with the existing field while
   * allowing the cleaner productAvailable field above.
   */

  if (
    input.productAvailable === undefined &&
    input.productAvailableInRequestedMarket !== undefined
  ) {

    productAvailable =
      productAvailableInRequestedMarket;
  }


  /*
   * ---------------------------------------------------------
   * REGIONAL RESULT
   * ---------------------------------------------------------
   *
   * #6 owns regional-market logic.
   * #12 only determines whether the resulting regional path
   * still requires customer choice.
   */

  var regionalSearch =
    input.regionalSearch === true;

  var regionalAlternativeFound =
    input.regionalAlternativeFound === true;

  var regionalOptionAccepted =
    input.customerAcceptedRegionalOption === true;

  var regionalShippingAccepted =
    input.customerAcceptedRegionalShipping === true;

  var regionalOptions =
    cleanArray(input.regionalOptions);


  /*
   * ---------------------------------------------------------
   * SHIPPING RESULT
   * ---------------------------------------------------------
   *
   * #10 owns shipping verification.
   * #12 does not calculate shipping eligibility.
   */

  var shippingEligibility =
    cleanString(input.shippingEligibility);

  var shippingType =
    cleanString(input.shippingType);

  var shippingVerified =
    input.shippingVerified === true;

  var shippingFee =
    validNumber(input.shippingFee)
      ? input.shippingFee
      : null;

  var shippingCurrency =
    cleanString(input.shippingCurrency);


  /*
   * ---------------------------------------------------------
   * PRICING / CURRENCY RESULT
   * ---------------------------------------------------------
   *
   * #7 owns customer-budget normalization into USD.
   *
   * #9 owns customer-facing conversion of verified USD
   * market prices into the customer's preferred currency
   * using Bit 1B shared verified FX infrastructure.
   *
   * #12 does NOT perform currency conversion.
   *
   * #12 only verifies that the customer-facing converted
   * price supplied by the upstream pricing logic is ready.
   */

  var customerCurrency =
    cleanString(input.customerCurrency);

  var convertedProductPrice =
    validNumber(input.convertedProductPrice)
      ? input.convertedProductPrice
      : null;

  /*
   * Support the richer customerPrice object supplied by
   * Market-Aware Pricing #9 when available.
   */

  var customerPrice =
    input.customerPrice &&
    typeof input.customerPrice === "object"
      ? input.customerPrice
      : null;

  /*
   * If the simple convertedProductPrice field is absent,
   * accept the verified amount from customerPrice.
   *
   * No conversion is performed here.
   */

  if (
    convertedProductPrice === null &&
    customerPrice
  ) {

    convertedProductPrice =
      validNumber(customerPrice.amount)
        ? customerPrice.amount
        : null;
  }

  /*
   * Prefer the explicit customerCurrency field.
   *
   * If absent, accept the currency supplied by the
   * customerPrice object.
   */

  if (
    customerCurrency === null &&
    customerPrice
  ) {

    customerCurrency =
      cleanString(customerPrice.currency);
  }

  /*
   * Conversion verification may be supplied either by the
   * explicit #9 field or by the richer customerPrice object.
   */

  var priceConversionVerified =
    input.priceConversionVerified === true ||
    (
      customerPrice &&
      customerPrice.verified === true
    );

  var pricePresentationReady =
    input.pricePresentationReady === true;

  /*
   * The final integration layer independently validates the
   * presentation state instead of blindly trusting the
   * presentation flag.
   */

  var customerPriceReady =
    pricePresentationReady === true &&
    priceConversionVerified === true &&
    customerCurrency !== null &&
    convertedProductPrice !== null;


  /*
   * ---------------------------------------------------------
   * FX METADATA
   * ---------------------------------------------------------
   *
   * Informational only.
   *
   * #12 does not calculate, modify, or obtain an exchange
   * rate. It simply preserves verified metadata supplied by
   * the upstream pricing layer.
   */

  var exchangeRate =
    validNumber(input.exchangeRate)
      ? input.exchangeRate
      : null;

  var exchangeRateTimestamp =
    cleanString(input.exchangeRateTimestamp);

  var exchangeRateSource =
    cleanString(input.exchangeRateSource);

  if (customerPrice) {

    if (
      exchangeRate === null &&
      validNumber(customerPrice.exchangeRate)
    ) {

      exchangeRate =
        customerPrice.exchangeRate;
    }

    if (
      exchangeRateTimestamp === null
    ) {

      exchangeRateTimestamp =
        cleanString(
          customerPrice.exchangeRateTimestamp
        );
    }

    if (
      exchangeRateSource === null
    ) {

      exchangeRateSource =
        cleanString(
          customerPrice.exchangeRateSource
        );
    }
  }


  /*
   * ---------------------------------------------------------
   * CUSTOMER DECISION RESULT
   * ---------------------------------------------------------
   *
   * #11 owns purchase readiness and customer confirmation.
   * #12 consumes its decision state.
   */

  var purchasePath =
    cleanString(input.purchasePath);

  var requiresCustomerDecision =
    input.requiresCustomerDecision === true;

  var customerConfirmed =
    input.customerConfirmed === true;


  /*
   * ---------------------------------------------------------
   * RESULT
   * ---------------------------------------------------------
   */

  var result = {

    success: true,

    action:
      "review_required",

    customerConfirmationRequired:
      false,

    shoppingCountry:
      shoppingCountry,

    deliveryCountry:
      deliveryCountry,

    message:
      null,

    pricePresentationReady:
      customerPriceReady,

    customerCurrency:
      customerCurrency,

    convertedProductPrice:
      customerPriceReady
        ? convertedProductPrice
        : null,

    priceConversionVerified:
      priceConversionVerified,

    exchangeRate:
      customerPriceReady
        ? exchangeRate
        : null,

    exchangeRateTimestamp:
      customerPriceReady
        ? exchangeRateTimestamp
        : null,

    exchangeRateSource:
      customerPriceReady
        ? exchangeRateSource
        : null

  };


  /*
   * =========================================================
   * FINAL GATE 1
   *
   * CUSTOMER-FACING PRICE MUST BE READY.
   * =========================================================
   */

  if (!customerPriceReady) {

    result.action =
      "price_conversion_required";

    result.customerConfirmationRequired =
      false;

    result.message =
      "The product price has not yet been verified as converted into the customer's currency and ready for presentation.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 2
   *
   * PRODUCT MUST HAVE A VALID CATALOGUE PATH.
   * =========================================================
   */

  if (
    input.productAvailable === false ||
    input.productAvailableInRequestedMarket === false
  ) {

    /*
     * If a regional alternative exists and regional search
     * is allowed, customer choice is required.
     */

    if (
      regionalAlternativeFound &&
      regionalSearch
    ) {

      result.action =
        "regional_customer_choice_required";

      result.customerConfirmationRequired =
        true;

      result.regionalAlternativeFound =
        true;

      result.regionalOptions =
        regionalOptions;

      result.message =
        "The product is not available in the customer's requested market, but a regional alternative is available. The customer must choose whether to proceed with the regional option.";

      return result;
    }

    /*
     * Regional option exists but customer has not permitted
     * regional shopping.
     */

    if (
      regionalAlternativeFound &&
      !regionalSearch
    ) {

      result.action =
        "remain_requested_market";

      result.customerConfirmationRequired =
        false;

      result.message =
        "The product is not available in the requested market. A regional alternative may exist, but regional shopping has not been authorized.";

      return result;
    }

    /*
     * No valid product path.
     */

    result.action =
      "cannot_proceed";

    result.customerConfirmationRequired =
      false;

    result.message =
      "There is no verified product path available in the customer's requested market.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 3
   *
   * SHIPPING MUST BE VERIFIED.
   * =========================================================
   */

  if (
    shippingVerified !== true ||
    shippingEligibility === null ||
    shippingEligibility === "unknown"
  ) {

    result.action =
      "shipping_verification_required";

    result.customerConfirmationRequired =
      false;

    result.message =
      "Shipping eligibility for the selected product and delivery country has not been sufficiently verified.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 4
   *
   * PRODUCT CANNOT PROCEED IF SHIPPING IS NOT ELIGIBLE.
   * =========================================================
   */

  if (
    shippingEligibility === "not_eligible"
  ) {

    if (
      regionalAlternativeFound &&
      regionalSearch
    ) {

      result.action =
        "regional_customer_choice_required";

      result.customerConfirmationRequired =
        true;

      result.regionalAlternativeFound =
        true;

      result.regionalOptions =
        regionalOptions;

      result.message =
        "The selected product cannot be shipped to the customer's delivery country. A regional alternative may be available and requires the customer's choice.";

      return result;
    }

    result.action =
      "cannot_proceed";

    result.customerConfirmationRequired =
      false;

    result.message =
      "The selected product cannot be shipped to the customer's delivery country.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 5
   *
   * CONDITIONAL / REGIONAL SHIPPING REQUIRES CUSTOMER CHOICE.
   * =========================================================
   */

  if (
    shippingEligibility === "regional_only"
  ) {

    if (
      !regionalOptionAccepted ||
      !regionalShippingAccepted
    ) {

      result.action =
        "regional_shipping_confirmation";

      result.customerConfirmationRequired =
        true;

      result.message =
        "The selected purchase path requires a regional shipping arrangement. The customer must explicitly accept that arrangement before proceeding.";

      return result;
    }
  }


  if (
    shippingEligibility === "conditional"
  ) {

    result.action =
      "conditional_shipping_confirmation";

    result.customerConfirmationRequired =
      true;

    result.message =
      "The selected product has conditional shipping requirements. The customer must review and accept the applicable shipping condition before proceeding.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 6
   *
   * PRODUCT-SPECIFIC SHIPPING FEE.
   *
   * The fee itself does not automatically mean the customer
   * must be asked for a separate market decision. It must
   * simply be presented accurately.
   * =========================================================
   */

  if (
    shippingFee !== null &&
    shippingFee > 0
  ) {

    result.shippingFee =
      shippingFee;

    result.shippingCurrency =
      shippingCurrency;

    /*
     * If #11 already determined that customer confirmation
     * is required, preserve that state.
     */

    if (requiresCustomerDecision) {

      result.action =
        "purchase_confirmation_required";

      result.customerConfirmationRequired =
        true;

      result.message =
        "The product price is ready for presentation and shipping is verified, but the customer must confirm the purchase path. The product-specific shipping fee must be shown separately.";

      return result;
    }

    /*
     * If no other decision is outstanding, the shipping fee
     * is simply part of the purchase presentation.
     */

    result.action =
      "purchase_confirmation_required";

    result.customerConfirmationRequired =
      true;

    result.message =
      "The product price is ready for presentation and shipping is verified. A product-specific shipping fee must be shown separately before asking the customer to proceed.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 7
   *
   * REGIONAL ALTERNATIVE.
   * =========================================================
   *
   * This is reached only when the regional path has already
   * been established by the upstream regional/pricing logic.
   */

  if (
    regionalAlternativeFound &&
    regionalSearch &&
    !regionalOptionAccepted
  ) {

    result.action =
      "regional_customer_choice_required";

    result.customerConfirmationRequired =
      true;

    result.regionalAlternativeFound =
      true;

    result.regionalOptions =
      regionalOptions;

    result.message =
      "A regional purchase option is available. The customer must explicitly choose whether to proceed with it.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 8
   *
   * #11 CUSTOMER DECISION.
   * =========================================================
   */

  if (
    purchasePath ===
      "price_conversion_required"
  ) {

    result.action =
      "price_conversion_required";

    result.customerConfirmationRequired =
      false;

    result.message =
      "The customer-facing product price must be converted and verified before continuing.";

    return result;
  }


  if (
    purchasePath ===
      "shipping_verification_required"
  ) {

    result.action =
      "shipping_verification_required";

    result.customerConfirmationRequired =
      false;

    result.message =
      "Shipping must be verified before continuing.";

    return result;
  }


  if (
    purchasePath ===
      "cannot_proceed"
  ) {

    result.action =
      "cannot_proceed";

    result.customerConfirmationRequired =
      false;

    result.message =
      "The selected purchase path cannot proceed.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 9
   *
   * CUSTOMER CONFIRMATION.
   * =========================================================
   */

  if (
    requiresCustomerDecision &&
    !customerConfirmed
  ) {

    result.action =
      "purchase_confirmation_required";

    result.customerConfirmationRequired =
      true;

    result.message =
      "The product, customer-facing price, and shipping conditions are ready. Ask the customer whether they want to proceed.";

    return result;
  }


  /*
   * =========================================================
   * FINAL GATE 10
   *
   * CUSTOMER HAS CONFIRMED A VALID PATH.
   * =========================================================
   */

  if (
    customerConfirmed
  ) {

    result.action =
      "continue_purchase_path";

    result.customerConfirmationRequired =
      false;

    result.customerConfirmed =
      true;

    result.message =
      "The customer has confirmed the verified purchase path. Continue without changing the shopping market, delivery country, product price, or shipping conditions.";

    return result;
  }


  /*
   * =========================================================
   * FINAL DEFAULT
   * =========================================================
   *
   * Never automatically assume purchase readiness.
   */

  result.action =
    "purchase_confirmation_required";

  result.customerConfirmationRequired =
    true;

  result.message =
    "The product, customer-facing price, and shipping information are ready. Ask the customer to confirm whether they want to proceed.";

  return result;
};


/*
 * =========================================================
 * AGENT GUIDANCE
 * =========================================================
 */

GT.finalIntegrationGuidance = [

  "Use the customer's shopping country to preserve the requested shopping path.",

  "The customer's shopping country is not itself an internal market identifier. Resolve the applicable internal market through the commerce infrastructure.",

  "Always preserve the customer's requested market unless the customer explicitly chooses another purchase path.",

  "The primary-market product catalogue must be resolved before a regional alternative is considered.",

  "Do not silently switch the customer to another market.",

  "Do not silently switch the customer's delivery country.",

  "Do not assume that the same product has the same price in different markets.",

  "Market-specific prices must remain separate.",

  "Budget #7 owns customer-budget normalization into USD.",

  "Market-Aware Pricing #9 uses Bit 1B shared verified FX infrastructure to convert verified USD market prices into the customer's preferred currency for customer-facing presentation.",

  "Final Integration #12 does not perform currency conversion or independent currency math.",

  "The product price must be converted into the customer's currency before it is treated as ready for customer-facing presentation.",

  "pricePresentationReady must only be treated as true when the converted customer-currency price has been verified.",

  "Do not present an unverified converted price as a confirmed customer-facing price.",

  "Product/Catalogue #8 owns product availability and catalogue matching.",

  "Regional Market #6 owns regional-search permission and regional alternative logic.",

  "Shipping Eligibility #10 owns shipping eligibility and shipping conditions.",

  "Market-Aware Pricing #9 owns market-specific price comparison and customer-facing price conversion.",

  "Customer Decision #11 owns purchase readiness and customer confirmation.",

  "Final Integration must not duplicate or override the authoritative result of the upstream tools.",

  "If shipping eligibility is unknown, do not continue.",

  "If shipping eligibility is not eligible, do not present the product as directly purchasable for that destination.",

  "If shipping is conditional or regional-only, require the appropriate customer decision before proceeding.",

  "A product-specific shipping fee must be presented separately from the product price.",

  "Do not claim that shipping is free unless the actual shipping result has verified free shipping.",

  "A regional alternative requires explicit customer choice before proceeding.",

  "Permission to search regionally does not equal acceptance of a specific regional product.",

  "Do not apply a regional market price to the customer's primary market.",

  "Do not expose internal market identifiers or supplier/vendor information to the customer.",

  "Do not invent missing product, price, currency, shipping, or market information.",

  "The customer remains in control whenever a market, price, shipping, or regional exception changes the normal purchase path.",

  "Only continue to the purchase path when all required upstream conditions are resolved and the customer has confirmed when confirmation is required."

];


/*
 * =========================================================
 * REGISTER #12 TOOL
 * =========================================================
 */

if (
  document.modelContext &&
  typeof document.modelContext.registerTool ===
    "function"
) {

  try {

    document.modelContext.registerTool({

      name:
        "godrerytone_final_integration",

      description:
        "Provide the final integration and purchase-path gate for GodreryTone shopping. Coordinate the verified results from product catalogue availability, regional-market logic, customer-budget normalization, market-specific pricing, customer-currency conversion, shipping eligibility, and customer decision logic without duplicating their authority. The tool requires the customer-facing product price to be converted through the shared verified FX infrastructure and verified as presentation-ready before allowing a purchase path to continue. It never performs currency conversion itself and never silently changes the customer's shopping market, delivery country, product price, regional option, or shipping conditions.",

      inputSchema: {

        type: "object",

        properties: {

          shoppingCountry: {
            type: "string",
            description:
              "The customer's shopping country."
          },

          deliveryCountry: {
            type: "string",
            description:
              "The customer's requested delivery country."
          },

          productAvailable: {
            type: "boolean",
            description:
              "Whether a valid product path has been verified by Product Catalogue #8."
          },

          productAvailableInRequestedMarket: {
            type: "boolean",
            description:
              "Whether the selected product is available in the customer's requested market."
          },

          regionalAlternativeFound: {
            type: "boolean",
            description:
              "Whether the regional logic has identified a suitable alternative."
          },

          regionalSearch: {
            type: "boolean",
            description:
              "Whether the customer has permitted regional shopping."
          },

          regionalOptions: {
            type: "array",
            description:
              "Verified regional options supplied by the regional and catalogue logic."
          },

          customerAcceptedRegionalOption: {
            type: "boolean",
            description:
              "Whether the customer explicitly accepted the specific regional option."
          },

          customerAcceptedRegionalShipping: {
            type: "boolean",
            description:
              "Whether the customer explicitly accepted a different regional shipping arrangement."
          },

          shippingVerified: {
            type: "boolean",
            description:
              "Whether shipping information has been verified by Shipping Eligibility #10 for the selected product and destination."
          },

          shippingEligibility: {
            type: "string",
            description:
              "Verified shipping eligibility state supplied by Shipping Eligibility #10."
          },

          shippingType: {
            type: "string",
            description:
              "Verified shipping type supplied by Shipping Eligibility #10."
          },

          shippingFee: {
            type: "number",
            description:
              "Verified product-specific shipping fee when applicable."
          },

          shippingCurrency: {
            type: "string",
            description:
              "Currency of the verified shipping fee."
          },

          customerCurrency: {
            type: "string",
            description:
              "The customer's currency used for customer-facing price presentation."
          },

          convertedProductPrice: {
            type: "number",
            description:
              "Verified product price converted into the customer's currency by Market-Aware Pricing #9 through the shared Bit 1B FX infrastructure."
          },

          customerPrice: {
            type: "object",
            description:
              "Optional richer customer-facing price result supplied by Market-Aware Pricing #9.",
            properties: {

              amount: {
                type: "number"
              },

              currency: {
                type: "string"
              },

              exchangeRate: {
                type: "number"
              },

              exchangeRateTimestamp: {
                type: "string"
              },

              exchangeRateSource: {
                type: "string"
              },

              verified: {
                type: "boolean"
              }

            }
          },

          exchangeRate: {
            type: "number",
            description:
              "Verified exchange rate supplied by Market-Aware Pricing #9. Final Integration does not calculate this value."
          },

          exchangeRateTimestamp: {
            type: "string",
            description:
              "Timestamp of the verified exchange rate supplied by Market-Aware Pricing #9."
          },

          exchangeRateSource: {
            type: "string",
            description:
              "Source identifier for the verified exchange rate supplied by Market-Aware Pricing #9."
          },

          priceConversionVerified: {
            type: "boolean",
            description:
              "Whether the product price conversion into the customer's currency has been verified by the upstream pricing logic."
          },

          pricePresentationReady: {
            type: "boolean",
            description:
              "Whether the converted product price is verified and ready for customer-facing presentation."
          },

          purchasePath: {
            type: "string",
            description:
              "Purchase-path state supplied by Customer Decision #11."
          },

          requiresCustomerDecision: {
            type: "boolean",
            description:
              "Whether Customer Decision #11 requires explicit customer confirmation."
          },

          customerConfirmed: {
            type: "boolean",
            description:
              "Whether the customer has explicitly confirmed the presented purchase path."
          }

        },

        required: []

      },

      execute: async function(input) {

        return JSON.stringify(
          GT.finalIntegration(input)
        );

      }

    });

    console.info(
      "[GodreryTone WebMCP] Final integration tool registered successfully."
    );

  } catch (error) {

    console.error(
      "[GodreryTone WebMCP] Final integration tool registration failed:",
      error
    );

  }

}


console.info(
  "[GodreryTone WebMCP] #12 final integration loaded successfully."
);
})();
