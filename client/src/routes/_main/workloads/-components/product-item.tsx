import { Pen, Trash } from "lucide-react";

import { useTranslation } from "react-i18next";
import ProductModal from "./product-modal";
import type { Product } from "@keepit/schemas";
import { Button } from "@/components";
import { useDeleteProduct, useLocale, useModal, useUpdateProduct } from "@/hooks";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";

interface Props {
  product: Product;
}

export default function ProductItem({ product }: Props) {
  const { t } = useTranslation();
  const { deleteProduct, isDeletingProduct } = useDeleteProduct();
  const { updateProduct } = useUpdateProduct();
  const modal = useModal<Product>();
  const locale = useLocale();

  const name = localized(product.translations, locale, "name");
  const description = localized(product.translations, locale, "description");

  return (
    <>
      <div className="border border-(--border) rounded-md overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between px-4 py-3 gap-8 bg-(--page-bg) border-b border-(--border)">
          <div>
            <p className="text-md text-gray-900">
              {name}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(product.createdAt || "")}
            </p>
          </div>
        </div>

        <div className="px-4 py-2">

          <p className="text-md font-light text-gray-800 mt-0.5">
            {description}
          </p>
        </div>


        <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
          {/* Actions left */}
          <div className="flex items-center gap-2">
            {/*} <Button variant="secondary" size="sm" icon={<ExternalLink size={15} />}>
              {t("section.offers")}
            </Button>
            <Button variant="secondary" size="sm" icon={<ExternalLink size={15} />}>
              {t("section.orders")}
            </Button>*/}
          </div>
          {/* Actions right */}
          <div className="flex items-center gap-2">
            <Button
              variant="border"
              icon={<Pen size={14} />}
              iconOnly
              onClick={() => modal.open(product)}
              size="sm"
            />
            <Button
              variant="secondary"
              loading={isDeletingProduct}
              danger
              icon={<Trash size={14} />}
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
