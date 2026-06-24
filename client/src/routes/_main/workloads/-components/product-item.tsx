import { Pen, Trash } from "lucide-react";

import { Link } from "@tanstack/react-router";
import ProductModal from "./product-modal";
import type { Product } from "@/types";
import { Button } from "@/components";
import { useLocale, useModal, useProductHook } from "@/hooks";
import { localized } from "@/lib/i18n-content";

export default function ProductItem({ product }: { product: Product }) {
  const { deleteProduct, updateProduct, isDeletingProduct } = useProductHook();
  const modal = useModal<Product>();
  const locale = useLocale();

  const name = localized(product.translations, locale, "name");
  const description = localized(product.translations, locale, "description");

  return (
    <>
      <div className="bg-white border border-(--border) rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <Link
              to="/workloads/$id"
              params={{ id: product.id }}
              className="text-md text-gray-900"
            >
              {name}
            </Link>
            <p className="text-sm font-light text-gray-400 mt-0.5">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              icon={<Pen className="size-3.5" />}
              iconOnly
              onClick={() => modal.open(product)}
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

        {/*
       {configs.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center px-4 py-1.5 border-b border-(--border) bg-(--page-bg)">
              <span className="text-caption text-gray-400">Vertrag</span>
              <span className="text-caption text-gray-400 text-center">Menge</span>
              <span className="text-caption text-gray-400 text-center">Laufzeit</span>
              <span className="text-caption text-gray-400 text-right">Preis</span>
            </div>
            {configs.map((config) => (
              <div key={config.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center px-4 py-1 border-b border-(--border)">
                <p className="text-sm text-gray-700 truncate">
                  <Badge variant="generated">{localized(config.contract?.translations, locale, "name")}</Badge>
                </p>
                <p className="text-sm text-gray-600 text-center">
                  {config.min_quantity}–{config.max_quantity ?? "∞"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  {config.duration} Monate
                </p>
                <p className="text-sm font-medium text-gray-900 text-right">
                  {formatEur(config.price)}
                </p>
              </div>
            ))}
          </>
        )}
      */}
      </div>

      {modal.isOpen && (
        <ProductModal
          key={modal.key}
          onClose={modal.close}
          submitFn={(value) =>
            updateProduct({ id: product.id, product: value })
          }
          currentItem={{ translations: product.translations }}
        />
      )}
    </>
  );
}
