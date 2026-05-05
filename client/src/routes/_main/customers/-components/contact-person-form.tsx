import { useState } from "react";
import { z } from "zod";

import { Button, Input } from "@/components";

const contactPersonSchema = z.object({
  salutation: z.string().min(1, "Anrede fehlt"),
  firstName: z.string().min(1, "Vorname fehlt"),
  lastName: z.string().min(1, "Nachname fehlt"),
  email: z.email().optional(),
});

type ContactPersonData = {
  salutation: string;
  firstName: string;
  lastName: string;
  email?: string;
};

interface Props {
  onSave: (data: ContactPersonData) => void;
  onCancel: () => void;
}

export default function ContactPersonForm({ onSave, onCancel }: Props) {
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = () => {
    const result = contactPersonSchema.safeParse({
      salutation,
      firstName,
      lastName,
      email: email || undefined,
    });
    if (!result.success) {
      setErrors(
        result.error.issues
          .map((e: { message: string }) => e.message)
          .filter(Boolean),
      );
      return;
    }
    onSave({ salutation, firstName, lastName, email: email || undefined });
  };

  return (
    <div className="bg-gray-100 w-full grid gap-3 border border-(--border) p-2 rounded-md">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            value={salutation}
            label="Anrede"
            onChange={(e) => setSalutation(e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="flex-1">
          <Input
            value={firstName}
            label="Vorname"
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="flex-1">
          <Input
            value={lastName}
            label="Nachname"
            onChange={(e) => setLastName(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>
      <div className="flex">
        <div className="flex-1">
          <Input
            value={email}
            label="E-Mail"
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <p className="text-sm text-red-400">{errors.join(" & ")}</p>
      )}

      <div className="flex gap-2 ml-auto mt-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          Speichern
        </Button>
      </div>
    </div>
  );
}
