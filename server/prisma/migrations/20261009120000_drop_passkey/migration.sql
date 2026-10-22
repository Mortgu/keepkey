-- Passkey-Anmeldung entfernt: Tabelle samt Fremdschlüssel und Indizes löschen.
-- Registrierte Passkeys gehen dabei verloren; die Anmeldung per Passwort bleibt.
DROP TABLE "passkey";
