import type { Metadata } from "next";
import { UploadCredentialForm } from "./upload-form";

export const metadata: Metadata = {
  title: "Upload Credential | Career Support | Kaziin",
  description:
    "Upload your completed training certificate. After verification, your Kaziin profile and job matches update automatically.",
};

export default function UploadCredentialPage() {
  return <UploadCredentialForm />;
}
