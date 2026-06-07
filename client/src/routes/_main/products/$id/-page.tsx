import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Server } from "lucide-react";
import type { Product, Tariff } from "@/types";
import { useLocale } from "@/hooks";
import { api } from "@/lib/api-client";
import { localized } from "@/lib/i18n-content";

export function ProductDetailPage() {
  const params = useParams({ from: "/_main/products/$id/" });
  const locale = useLocale();

  const { data: product } = useQuery({
    queryKey: ["product", params.id],
    queryFn: () => api<Product>(`/api/products/${params.id}`),
  });
  console.log(product);

  const { data: tariff } = useQuery({
    queryKey: ["tariff", product?.tariffId],
    queryFn: () => api<Tariff>(`/api/tariffs/${product?.tariffId}`),
  });

  console.log(tariff);

  return (
    <div className="grid gap-5">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <h1 className="text-2xl font-medium">Preiskonfiguration</h1>
            <p className="text-md text-(--text-600)">
              Preise je Tarif, Laufzeit und Mengenstaffel pflegen.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-(--border) bg-white px-3 py-1.5 text-sm text-(--text-600)">
            <Server className="size-4 text-(--primary)" />
            Mock-Daten
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-md border border-(--border) bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-(--text)">
              {localized(product?.translations, locale, "name")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-(--text-600)">
              {localized(product?.translations, locale, "description")}
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <div className="grid gap-4"></div>
    </div>
  );
}
