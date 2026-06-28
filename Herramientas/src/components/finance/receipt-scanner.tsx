"use client";

import { useState, useRef, FormEvent } from "react";
import {
  Camera,
  Upload,
  ScanLine,
  Loader2,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useScanReceipt, useCreateTransaction } from "@/hooks/use-finance";
import { useOwnerConfig } from "@/hooks/use-owner-config";
import { autoCategorizeExpense, formatCurrency } from "@/lib/finance";
import type { ScannedReceipt, TransactionOwner, PaymentMethod } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export function ReceiptScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedReceipt | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const scan = useScanReceipt();
  const create = useCreateTransaction();
  const { persona1Name, persona2Name } = useOwnerConfig();

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande (máx 8MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageData(result);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!imageData) {
      toast.error("Primero subí o sacá una foto del recibo");
      return;
    }
    try {
      const result = await scan.mutateAsync({ image: imageData });
      setScanResult(result);
      toast.success("¡Recibo leído! Revisá los datos antes de guardar.");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo leer el recibo");
    }
  }

  function handleReset() {
    setImagePreview(null);
    setImageData(null);
    setScanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!scanResult) return;
    try {
      await create.mutateAsync({
        date: scanResult.date,
        desc: scanResult.desc,
        amount: scanResult.amount,
        type: scanResult.type,
        method: scanResult.method,
        owner: scanResult.owner,
        category: scanResult.category,
      });
      toast.success(`Operación guardada: ${formatCurrency(scanResult.amount)}`);
      handleReset();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo guardar la operación");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Escanear Recibo
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Sacá una foto o subí una imagen de tu recibo. La IA extraerá los
          datos automáticamente.
        </p>
      </div>

      {/* Banner informativo */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-800">
            IA Vision · Lectura automática
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            La inteligencia artificial analizará tu recibo y extraerá el monto,
            comercio, fecha y método de pago. Siempre podés revisar y editar
            antes de confirmar.
          </p>
        </div>
      </div>

      {/* Input hidden para cámara y archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {/* Zona de captura / preview */}
      {!imagePreview ? (
        <Card className="border-slate-200 shadow-sm border-dashed">
          <CardContent className="p-0">
            <div className="p-8 sm:p-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ScanLine className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  Capturá tu recibo
                </h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                  Sacá una foto con la cámara o subí una imagen desde tu
                  dispositivo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Sacar foto
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="lg"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Subir imagen
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Recibo capturado
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleReset}
                aria-label="Quitar imagen"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Recibo capturado"
                className="max-h-80 w-auto object-contain"
              />
            </div>

            {!scanResult ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleScan}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                  disabled={scan.isPending}
                  size="lg"
                >
                  {scan.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analizando recibo…
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-5 h-5 mr-2" />
                      Leer recibo con IA
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cambiar imagen
                </Button>
              </div>
            ) : (
              <ConfirmForm
                result={scanResult}
                onUpdate={setScanResult}
                onConfirm={handleConfirm}
                isSaving={create.isPending}
                persona1Name={persona1Name}
                persona2Name={persona2Name}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          Consejos para mejor lectura
        </h4>
        <ul className="text-xs text-slate-600 space-y-1 ml-6 list-disc">
          <li>Asegurate de que el monto total se vea claramente.</li>
          <li>Evitá reflejos y sombras sobre el papel.</li>
          <li>Incluí todo el recibo en la foto (comercio + total).</li>
          <li>Funciona con tickets de supermercado, facturas, recibos de café, etc.</li>
        </ul>
      </div>
    </div>
  );
}

// ============ Formulario de confirmación ============

function ConfirmForm({
  result,
  onUpdate,
  onConfirm,
  isSaving,
  persona1Name,
  persona2Name,
}: {
  result: ScannedReceipt;
  onUpdate: (r: ScannedReceipt) => void;
  onConfirm: (e: FormEvent) => void;
  isSaving: boolean;
  persona1Name: string;
  persona2Name: string;
}) {
  function update(field: keyof ScannedReceipt, value: any) {
    onUpdate({ ...result, [field]: value });
  }

  return (
    <form onSubmit={onConfirm} className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p className="text-sm text-emerald-800">
          <strong>Datos extraídos.</strong> Revisá y ajustá si es necesario
          antes de guardar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="r-type">Tipo</Label>
          <Select
            value={result.type}
            onValueChange={(v) => update("type", v as ScannedReceipt["type"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasto">Gasto / Egreso</SelectItem>
              <SelectItem value="ingreso">Ingreso / Cobro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="r-date">Fecha</Label>
          <Input
            id="r-date"
            type="date"
            value={result.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="r-desc">Concepto / Comercio</Label>
        <Input
          id="r-desc"
          value={result.desc}
          onChange={(e) => update("desc", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="r-amount">Monto (ARS)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>
            <Input
              id="r-amount"
              type="number"
              step="0.01"
              min="0"
              value={result.amount || ""}
              onChange={(e) => update("amount", parseFloat(e.target.value) || 0)}
              required
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Método de Pago</Label>
          <Select
            value={result.method}
            onValueChange={(v) => update("method", v as PaymentMethod)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia / Débito</SelectItem>
              <SelectItem value="tc">Tarjeta de Crédito</SelectItem>
              <SelectItem value="billetera">Billetera Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>¿A quién corresponde?</Label>
        <RadioGroup
          value={result.owner}
          onValueChange={(v) => update("owner", v as TransactionOwner)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100"
        >
          <OwnerRadio value="persona1" label={persona1Name} accent="text-blue-600" />
          <OwnerRadio value="persona2" label={persona2Name} accent="text-pink-600" />
          <OwnerRadio value="pareja" label="Gasto Compartido" accent="text-purple-600" />
        </RadioGroup>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-sm">
        <span className="text-slate-500">Categoría detectada: </span>
        <span className="font-semibold text-slate-800">{result.category}</span>
      </div>

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isSaving}
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Guardando…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Confirmar y guardar · {formatCurrency(result.amount)}
          </>
        )}
      </Button>
    </form>
  );
}

function OwnerRadio({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <Label
      htmlFor={`scan-owner-${value}`}
      className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-white transition-colors"
    >
      <RadioGroupItem id={`scan-owner-${value}`} value={value} className={accent} />
      <span className="text-sm text-slate-700 font-medium">{label}</span>
    </Label>
  );
}
