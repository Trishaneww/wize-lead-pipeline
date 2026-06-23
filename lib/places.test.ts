// Libs
import { describe, expect, it } from "vitest";
import { placesToBusinesses } from "@/lib/places";

describe("placesToBusinesses", () => {
  const place = {
    id: "ChIJ_place_1",
    displayName: { text: "Bright Smiles Dental" },
    websiteUri: "https://brightsmiles.example",
    formattedAddress: "123 King St W, Hamilton, ON",
    nationalPhoneNumber: "(905) 555-0123",
    primaryType: "dentist",
  };

  it("maps a full place into an ingest-ready business", () => {
    const [business] = placesToBusinesses([place], "dentist", "Hamilton, ON");
    expect(business).toEqual({
      businessName: "Bright Smiles Dental",
      websiteUrl: "https://brightsmiles.example",
      phone: "(905) 555-0123",
      address: "123 King St W, Hamilton, ON",
      city: "Hamilton, ON",
      category: "dentist",
      email: null,
      sourceRef: "ChIJ_place_1",
    });
  });

  it("nulls absent website/phone/address and keeps sourceRef (place_id)", () => {
    const [business] = placesToBusinesses(
      [{ id: "ChIJ_place_2", displayName: { text: "Joe's Plumbing" } }],
      "plumber",
      "Toronto, ON",
    );
    expect(business.websiteUrl).toBeNull();
    expect(business.phone).toBeNull();
    expect(business.address).toBeNull();
    expect(business.email).toBeNull();
    expect(business.sourceRef).toBe("ChIJ_place_2");
  });

  it("drops results with no displayName", () => {
    const businesses = placesToBusinesses(
      [{ id: "ChIJ_nameless" }, place],
      "dentist",
      "Hamilton, ON",
    );
    expect(businesses).toHaveLength(1);
    expect(businesses[0].sourceRef).toBe("ChIJ_place_1");
  });
});