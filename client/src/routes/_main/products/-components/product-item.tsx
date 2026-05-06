import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";

import { Pen, Plus, Trash } from "lucide-react";

import ProductModal from "./product-modal";
import { Button } from "@/components";
import { useContractHook, useProductHook } from "@/hooks";
import type { Product, CreateProductPricingInput } from "@/types";

const productPricingSchema = z.object({
  contractId: z.string().min(1),
  min_quantity: z.int(),
  max_quantity: z.int(),
  duration_months: z.int(),
  price: z.float32(),
});

export default function ProductItem(product: Product) {
  const {
    deleteProduct,
    updateProduct,
    isDeletingProduct,
    deletePricing,
    isDeletingPricing,
    createPricing,
  } = useProductHook();
  const { contracts } = useContractHook();

  const [isAddingPricing, addPricing] = useState<boolean>(false);
  const [isEditing, setEdit] = useState<boolean>(false);

  const { name, description, table } = product;

  const pricingForm = useForm({
    defaultValues: {
      contractId: contracts[0]?.id || "",
      min_quantity: 1,
      max_quantity: 2,
      duration_months: 12,
      price: 100,
    },
    validators: {
      onChange: productPricingSchema,
      onMount: productPricingSchema,
    },
    onSubmit: async ({ value }) => {
      createPricing({
        productId: product.id,
        pricing: value as CreateProductPricingInput,
      });
      addPricing(false);
    },
  });

  return (
    <>
      <div className="bg-white border border-(--border) rounded-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
          <div>
            <p className="text-md text-gray-900">{product.name}</p>
            <p className="text-sm font-light text-gray-400 mt-0.5">
              {product.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              icon={<Pen className="size-3.5" />}
              iconOnly
              onClick={() => setEdit(true)}
              size="sm"
            />
            <Button
              variant="ghost"
              loading={isDeletingProduct}
              icon={<Trash className="size-3.5" />}
              iconOnly
              onClick={() => deleteProduct(product.id)}
              size="sm"
            />
          </div>
        </div>

        {/* Pricing rows */}
        {product.productPricing.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1.5 border-b border-(--border) bg-(--page-bg)">
              <span className="text-caption text-gray-400">Vertrag</span>
              <span className="text-caption text-gray-400 text-center">
                Menge
              </span>
              <span className="text-caption text-gray-400 text-center">
                Laufzeit
              </span>
              <span className="text-caption text-gray-400 text-right">
                Preis
              </span>
              <span />
            </div>
            {product.productPricing.map((pricing, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1 border-b border-(--border)"
              >
                <p className="text-sm text-gray-700 truncate">
                  {pricing?.contract?.name}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  {pricing.min_quantity}–{pricing.max_quantity}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  {pricing.duration_months} Monate
                </p>
                <p className="text-sm font-medium text-gray-900 text-right">
                  {(pricing.price / 100).toFixed(2)} €
                </p>
                <div className="flex items-center gap-0.5 justify-end">
                  <Button
                    variant="link"
                    icon={<Pen className="size-3.5" />}
                    iconOnly
                    size="sm"
                  />
                  <Button
                    loading={isDeletingPricing}
                    onClick={() => deletePricing({ id: pricing.id })}
                    variant="link"
                    icon={<Trash className="size-3.5" />}
                    iconOnly
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Add Pricing Form */}
        {isAddingPricing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              pricingForm.handleSubmit(pricingForm);
            }}
            className="px-4 py-3 border-b border-(--border) flex flex-wrap gap-2 items-center"
          >
            <pricingForm.Field name="contractId">
              {(field) => (
                <select
                  id={field.name}
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="flex-2 h-8.5 px-2 border border-(--border) rounded-md outline-none text-sm bg-white"
                >
                  {contracts?.map((contract: any) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.name}
                    </option>
                  ))}
                </select>
              )}
            </pricingForm.Field>
            <pricingForm.Field name="min_quantity">
              {(field) => (
                <input
                  id={field.name}
                  value={field.state.value}
                  type="number"
                  className="flex-1 min-w-0 h-8.5 px-2 border border-(--border) rounded-md outline-none text-sm"
                  placeholder="Min"
                  onChange={(e) => field.handleChange(parseInt(e.target.value))}
                />
              )}
            </pricingForm.Field>
            <pricingForm.Field name="max_quantity">
              {(field) => (
                <input
                  id={field.name}
                  value={field.state.value}
                  type="number"
                  className="flex-1 min-w-0 h-8.5 px-2 border border-(--border) rounded-md outline-none text-sm"
                  placeholder="Max"
                  onChange={(e) => field.handleChange(parseInt(e.target.value))}
                />
              )}
            </pricingForm.Field>
            <pricingForm.Field name="duration_months">
              {(field) => (
                <input
                  id={field.name}
                  value={field.state.value}
                  type="number"
                  className="flex-1 min-w-0 h-8.5 px-2 border border-(--border) rounded-md outline-none text-sm"
                  placeholder="Laufzeit"
                  onChange={(e) => field.handleChange(parseInt(e.target.value))}
                />
              )}
            </pricingForm.Field>
            <pricingForm.Field name="price">
              {(field) => (
                <input
                  id={field.name}
                  value={field.state.value}
                  type="number"
                  step="1"
                  className="flex-1 min-w-0 h-8.5 px-2 border border-(--border) rounded-md outline-none text-sm"
                  placeholder="Preis"
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value))
                  }
                />
              )}
            </pricingForm.Field>
            <div className="flex gap-1 shrink-0">
              <pricingForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    disabled={!canSubmit}
                    loading={isSubmitting as boolean}
                    type="submit"
                    size="sm"
                  >
                    {!(isSubmitting as boolean) && "Speichern"}
                  </Button>
                )}
              </pricingForm.Subscribe>
              <Button
                onClick={() => addPricing(false)}
                type="button"
                size="sm"
                variant="secondary"
              >
                Abbrechen
              </Button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 flex items-center justify-end">
          <button
            onClick={() => addPricing(true)}
            className="flex items-center gap-1.5 text-sm text-(--primary-600) hover:text-(--primary-700) cursor-pointer transition-colors"
          >
            <Plus className="size-3.5" />
            Preis hinzufügen
          </button>
        </div>
      </div>

      <ProductModal
        open={isEditing}
        cancelFn={() => setEdit(false)}
        submitFn={(value) => updateProduct({ id: product.id, product: value })}
        currentItem={{ name, description, table }}
      />
    </>
  );
}
