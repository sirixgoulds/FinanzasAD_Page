"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Wallet,
  Calculator,
  Bell,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { authApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Completa email y contraseña");
      return;
    }
    setLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("¡Bienvenido de nuevo!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error("Completa todos los campos");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setRegLoading(true);
    try {
      await authApi.register(regName, regEmail, regPassword);
      toast.success("Cuenta creada. Iniciando sesión…");

      // Auto-login tras registro
      const result = await signIn("credentials", {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Cuenta creada. Inicia sesión manualmente.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Error al crear la cuenta");
      }
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      {/* Panel izquierdo — branding / hero (oculto en móvil) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.3) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-blue-600 p-2 rounded-xl">
              <Activity className="w-7 h-7" />
            </span>
            Finanzas AR
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Modo Contador Experto · Optimizado para Argentina
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Tu dinero,
            <br />
            <span className="text-blue-400">bajo control real.</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-md">
            Gestiona ingresos, gastos, inversiones y metas compartidas. Todo
            guardado en tu cuenta — accesible desde cualquier dispositivo.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <FeaturePill
              icon={<Wallet className="w-4 h-4" />}
              label="Movimientos"
            />
            <FeaturePill
              icon={<Calculator className="w-4 h-4" />}
              label="Calculadoras"
            />
            <FeaturePill
              icon={<TrendingUp className="w-4 h-4" />}
              label="Inversiones"
            />
            <FeaturePill icon={<Bell className="w-4 h-4" />} label="Alertas" />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Tus datos se almacenan cifrados de forma segura.
        </div>
      </div>

      {/* Panel derecho — formularios */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="bg-blue-600 p-2 rounded-xl text-white">
              <Activity className="w-6 h-6" />
            </span>
            <span className="text-2xl font-bold text-slate-900">
              Finanzas AR
            </span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Bienvenido</CardTitle>
                  <CardDescription>
                    Inicia sesión para ver tus finanzas guardadas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Contraseña</Label>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loginLoading}
                    >
                      {loginLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Ingresando…
                        </>
                      ) : (
                        "Ingresar"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Crear cuenta</CardTitle>
                  <CardDescription>
                    Tu información financiera quedará guardada y privada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nombre</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Tu nombre"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={regLoading}
                    >
                      {regLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando cuenta…
                        </>
                      ) : (
                        "Crear cuenta y empezar"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200">
      <span className="text-blue-400">{icon}</span>
      {label}
    </div>
  );
}
