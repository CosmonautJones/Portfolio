import type { Metadata } from "next";
import { VaultCube } from "@/components/vault/vault-cube";

export const metadata: Metadata = {
  title: "The Vault",
};

export default function VaultPage() {
  return (
    <main>
      <VaultCube />
    </main>
  );
}
