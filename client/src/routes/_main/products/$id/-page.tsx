import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";

export function ProductDetailPage() {
  const params = useParams({ from: "/_main/products/$id/" });

  useEffect(() => {
    const test = api<Product>(`/api/products/${params.id}`, {
      method: "GET",
    }).then((res) => console.log(res));
    console.log(test);
  }, []);

  return (
    <div>
      <div className="grid gap-2">
        <h1 className="text-2xl">Preiskonfiguration</h1>
        <p className="text-md text-(--text-600)">
          Preise je Tarif, Laufzeit und Mengenstaffel pflegen.
        </p>
      </div>
    </div>
  );
}
