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
      <div className="border border-(--border) rounded-md overflow-hidden  p-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-0.5">
              <p className="text-md font-medium">{name}</p>
              <p className="text-xs text-gray-400">
                {formatDate(product.createdAt || "")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="border"
                icon={<Pen size={14} />}
                iconOnly
                onClick={() => modal.open(product)}
                size="xs"
              />
              <Button
                variant="secondary"
                loading={isDeletingProduct}
                danger
                icon={<Trash size={14} />}
                iconOnly
                onClick={() => deleteProduct(product.id)}
                size="xs"
              />
            </div>
          </div>
          <p className="text-md font-light text-gray-800 mt-0.5">
            {description}
          </p>
        </div>
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
