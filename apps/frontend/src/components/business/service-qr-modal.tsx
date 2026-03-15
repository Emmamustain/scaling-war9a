"use client";

import { useState } from "react";
import { QrCode, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/backend-url";

interface ServiceQrModalProps {
  serviceId: string;
  serviceName: string;
}

export default function ServiceQrModal({ serviceId, serviceName }: ServiceQrModalProps) {
  const [open, setOpen] = useState(false);
  const qrUrl = `${getBackendUrl()}/qr/service/${serviceId}`;

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <QrCode className="size-4" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="size-5" />
            </button>

            <h2 className="mb-1 text-lg font-bold">{serviceName}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Scan to join this service queue
            </p>

            <div className="flex justify-center rounded-xl border border-border bg-white p-4">
              <img
                src={qrUrl}
                alt={`QR code for ${serviceName}`}
                className="h-64 w-64 object-contain"
              />
            </div>

            <a
              href={qrUrl}
              download={`war9a-service-${serviceId}.png`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Download className="size-4" />
              Download PNG
            </a>
          </div>
        </div>
      )}
    </>
  );
}
