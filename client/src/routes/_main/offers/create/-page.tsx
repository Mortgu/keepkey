import { Input, Select } from "@/components";
import ProductModalSection from "../-components/modal-components/product-section";
import { useState } from "react";
import type { OfferProductInput } from "../-components/modal-components/offer-product-form";

export function CreateOfferPage() {
  const [offerProducts, setOfferProducts] = useState<Array<OfferProductInput>>(
    [],
  );

  return (
    <section className="grid gap-4">
      {/* Head */}
      <div className="flex items-center justify-between pb-4 border-b border-(--border)">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Create new offer
        </h1>
      </div>

      {/* Body */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 grid gap-4 pr-4 border-r border-(--border)">
          <div className="flex items-center gap-4">
            <Select label="Kunde">
              <option>Musterfirma GmbH</option>
            </Select>
            <Select label="Ansprechpartner Kunde">
              <option>Max Mustermann</option>
            </Select>
            <Select label="Unser Ansprechpartner">
              <option>Oskar Sammet</option>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Input placeholder="AG-Nummer" />
          </div>
        </div>
        <div className="flex-1 pl-2">
          <ProductModalSection
            offerProducts={offerProducts}
            setOfferProducts={setOfferProducts}
          />
        </div>
      </div>
    </section>
  );
}
