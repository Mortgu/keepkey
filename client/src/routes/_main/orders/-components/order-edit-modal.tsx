import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Order } from "@/types";
import type { UpdateOrderInput } from "@/hooks/orders/order-api";
import {
  useContracts,
  useCustomerContacts,
  useCustomers,
  useFlatRates,
  useOrderManager,
  useProducts,
  useSuppliers,
  useUsers,
} from "@/hooks";
import { Button, Input, ModalDialog, Select, Textarea } from "@/components";
import { useTranslation } from "react-i18next";

type Props = {
  order: Order;
  onClose: () => void;
};

type Position = UpdateOrderInput["positions"][number] & { key: string };
type FlatRate = UpdateOrderInput["flatRates"][number] & { key: string };

const inputDate = (value?: string) => value?.slice(0, 10) ?? "";
const optionLabel = (translations: Array<{ name: string }>) => translations[0]?.name ?? "-";

export default function OrderEditModal({ order, onClose }: Props) {
  const { t } = useTranslation();
  const [expectedVersion] = useState(order.version);
  const { updateOrder, isUpdatingOrder } = useOrderManager();
  const { customers } = useCustomers();
  const { suppliers } = useSuppliers();
  const { users } = useUsers();
  const { products } = useProducts();
  const { contracts } = useContracts();
  const { flatRates: availableFlatRates } = useFlatRates();

  const [fields, setFields] = useState({
    supplierId: order.supplierId ?? "",
    customerId: order.customerId,
    contactPersonId: order.contactPersonId,
    employeeId: order.employeeId,
    orderId: order.orderId,
    paymentTerm: order.paymentTerm,
    projectNumber: order.projectNumber ?? "",
    projectDescription: order.projectDescription ?? "",
    orderDetails: order.orderDetails ?? "",
    date: inputDate(order.date),
    validUntil: inputDate(order.validUntil),
    requestFrom: inputDate(order.requestFrom),
  });
  const { contacts } = useCustomerContacts(fields.customerId);
  const [positions, setPositions] = useState<Array<Position>>(() =>
    order.orderPositions.map((position) => ({
      key: position.id,
      productId: position.productId,
      contractId: position.contractId,
      duration_months: position.duration_months,
      quantity: position.quantity,
      optional: position.optional ?? false,
      total_cents: position.total_cents,
    })),
  );
  const [flatRates, setFlatRates] = useState<Array<FlatRate>>(() =>
    order.flatRates.map((flatRate) => ({
      key: flatRate.id,
      flatRateId: flatRate.flatRateId,
      quantity: flatRate.quantity,
      total_cents: flatRate.total_cents,
    })),
  );

  const updateField = (name: keyof typeof fields, value: string) => {
    setFields((current) => ({ ...current, [name]: value }));
  };
  const updatePosition = (key: string, patch: Partial<Position>) => {
    setPositions((current) => current.map((position) =>
      position.key === key ? { ...position, ...patch } : position));
  };
  const updateFlatRate = (key: string, patch: Partial<FlatRate>) => {
    setFlatRates((current) => current.map((flatRate) =>
      flatRate.key === key ? { ...flatRate, ...patch } : flatRate));
  };

  const submit = async () => {
    try {
      await updateOrder({
        orderId: order.id,
        input: {
          expectedVersion,
          order: {
            supplierId: fields.supplierId || null,
            customerId: fields.customerId,
            contactPersonId: fields.contactPersonId,
            employeeId: fields.employeeId,
            orderId: fields.orderId,
            paymentTerm: fields.paymentTerm,
            projectNumber: fields.projectNumber || null,
            projectDescription: fields.projectDescription || null,
            orderDetails: fields.orderDetails || null,
            date: fields.date,
            validUntil: fields.validUntil || null,
            requestFrom: fields.requestFrom || null,
          },
          positions: positions.map((position) => ({
            productId: position.productId,
            contractId: position.contractId,
            duration_months: position.duration_months,
            quantity: position.quantity,
            optional: position.optional,
            total_cents: position.total_cents,
          })),
          flatRates: flatRates.map((flatRate) => ({
            flatRateId: flatRate.flatRateId,
            quantity: flatRate.quantity,
            total_cents: flatRate.total_cents,
          })),
        },
      });
      toast.success("Bestellung aktualisiert. Vorhandene Dokumente sind jetzt historisch.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bestellung konnte nicht aktualisiert werden.");
    }
  };

  return (
    <ModalDialog onClose={onClose}>
      <ModalDialog.Header><h1 className="text-lg">Bestellung bearbeiten</h1></ModalDialog.Header>
      <ModalDialog.Content>
        <div className="grid gap-5">
          <section className="grid grid-cols-2 gap-3">
            <Input label="Bestell-Nr." value={fields.orderId} onChange={(event) => updateField("orderId", event.target.value)} />
            <Input label="Bestelldatum" type="date" value={fields.date} onChange={(event) => updateField("date", event.target.value)} />
            <Select label="Kunde" value={fields.customerId} onChange={(event) => updateField("customerId", event.target.value)}
              options={customers.map((customer) => ({ value: customer.id, label: customer.companyName }))} />
            <Select label="Kundenkontakt" value={fields.contactPersonId} onChange={(event) => updateField("contactPersonId", event.target.value)}
              options={contacts.map((contact) => ({ value: contact.id, label: `${contact.firstName} ${contact.lastName}` }))} />
            <Select label="Mitarbeiter" value={fields.employeeId} onChange={(event) => updateField("employeeId", event.target.value)}
              options={users.map((user) => ({ value: user.id, label: user.name }))} />
            <Select label="Lieferant" value={fields.supplierId} placeholder="Kein Lieferant"
              onChange={(event) => updateField("supplierId", event.target.value)}
              options={suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name }))} />
            <Input label="Zahlungsbedingung" value={fields.paymentTerm} onChange={(event) => updateField("paymentTerm", event.target.value)} />
            <Input label="Projekt-Nr." value={fields.projectNumber} onChange={(event) => updateField("projectNumber", event.target.value)} />
            <Input label="Gültig bis" type="date" value={fields.validUntil} onChange={(event) => updateField("validUntil", event.target.value)} />
            <Input label="Anfrage vom" type="date" value={fields.requestFrom} onChange={(event) => updateField("requestFrom", event.target.value)} />
            <div className="col-span-2"><Textarea label="Projektbezug" value={fields.projectDescription}
              onChange={(event) => updateField("projectDescription", event.target.value)} /></div>
            <div className="col-span-2"><Textarea label="Bestelldetails" value={fields.orderDetails}
              onChange={(event) => updateField("orderDetails", event.target.value)} /></div>
          </section>

          <section className="grid gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Produkte</h2>
              <Button size="xs" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => setPositions((current) => [...current, {
                key: crypto.randomUUID(), productId: products[0]?.id ?? "", contractId: contracts[0]?.id ?? "",
                duration_months: 12, quantity: 1, optional: false, total_cents: 0,
              }])}>Produkt</Button>
            </div>
            {positions.map((position) => (
              <div key={position.key} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto_auto] items-end gap-2 rounded-md border border-(--border) p-2">
                <Select label="Produkt" value={position.productId} onChange={(event) => updatePosition(position.key, { productId: event.target.value, total_cents: 0 })}
                  options={products.map((product) => ({ value: product.id, label: optionLabel(product.translations) }))} />
                <Select label="Vertrag" value={position.contractId} onChange={(event) => updatePosition(position.key, { contractId: event.target.value, total_cents: 0 })}
                  options={contracts.map((contract) => ({ value: contract.id, label: optionLabel(contract.translations) }))} />
                <Input label="Monate" type="number" value={position.duration_months} onChange={(event) => {
                  const duration = Number(event.target.value);
                  updatePosition(position.key, {
                    duration_months: duration,
                    total_cents: position.duration_months > 0
                      ? Math.round(position.total_cents * duration / position.duration_months)
                      : position.total_cents,
                  });
                }} />
                <Input label="Menge" type="number" value={position.quantity} onChange={(event) => {
                  const quantity = Number(event.target.value);
                  updatePosition(position.key, {
                    quantity,
                    total_cents: position.quantity > 0
                      ? Math.round(position.total_cents * quantity / position.quantity)
                      : position.total_cents,
                  });
                }} />
                <Input label="Gesamt (Cent)" type="number" value={position.total_cents} onChange={(event) => updatePosition(position.key, { total_cents: Number(event.target.value) })} />
                <label className="mb-2 flex items-center gap-1 text-xs text-(--text-secondary)">
                  <input type="checkbox" checked={position.optional ?? false}
                    onChange={(event) => updatePosition(position.key, { optional: event.target.checked })} />
                  Optional
                </label>
                <Button size="xs" variant="ghost" iconOnly icon={<Trash className="size-4" />}
                  onClick={() => setPositions((current) => current.filter((item) => item.key !== position.key))} />
              </div>
            ))}
          </section>

          <section className="grid gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Pauschalen</h2>
              <Button size="xs" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => setFlatRates((current) => [...current, {
                key: crypto.randomUUID(), flatRateId: availableFlatRates[0]?.id ?? "", quantity: 1,
                total_cents: availableFlatRates[0]?.total_cents ?? 0,
              }])}>Pauschale</Button>
            </div>
            {flatRates.map((flatRate) => (
              <div key={flatRate.key} className="grid grid-cols-[2fr_1fr_1fr_auto] items-end gap-2 rounded-md border border-(--border) p-2">
                <Select label="Pauschale" value={flatRate.flatRateId} onChange={(event) => {
                  const selected = availableFlatRates.find((item) => item.id === event.target.value);
                  updateFlatRate(flatRate.key, {
                    flatRateId: event.target.value,
                    total_cents: (selected?.total_cents ?? 0) * flatRate.quantity,
                  });
                }}
                  options={availableFlatRates.map((item) => ({ value: item.id, label: optionLabel(item.translations) }))} />
                <Input label="Menge" type="number" value={flatRate.quantity} onChange={(event) => {
                  const quantity = Number(event.target.value);
                  updateFlatRate(flatRate.key, {
                    quantity,
                    total_cents: flatRate.quantity > 0
                      ? Math.round(flatRate.total_cents * quantity / flatRate.quantity)
                      : flatRate.total_cents,
                  });
                }} />
                <Input label="Gesamt (Cent)" type="number" value={flatRate.total_cents} onChange={(event) => updateFlatRate(flatRate.key, { total_cents: Number(event.target.value) })} />
                <Button size="xs" variant="ghost" iconOnly icon={<Trash className="size-4" />}
                  onClick={() => setFlatRates((current) => current.filter((item) => item.key !== flatRate.key))} />
              </div>
            ))}
          </section>
        </div>
      </ModalDialog.Content>
      <ModalDialog.Footer>
        <Button size="sm" variant="border" onClick={onClose}>{t("button.cancel")}</Button>
        <Button size="sm" onClick={submit} loading={isUpdatingOrder} disabled={isUpdatingOrder}>{t("button.save")}</Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
