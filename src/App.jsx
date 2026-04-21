import { useState, useEffect, useMemo } from "react";
import {
  Home, Users, Calendar, Sparkles, ClipboardList, Wallet,
  Plus, X, Phone, Cake, Trash2, Pencil, Search, ChevronRight,
  Clock, CircleCheck, CircleAlert, Star, TrendingUp, TrendingDown,
  MessageCircle, Heart, Droplet, Flame
} from "lucide-react";
import logoWax from "./assets/logo-wax.png";

/* ============================================================
   WAX — Sistema CRM para negocios de depilación y estética.
   Gestión completa de clientas, agenda, servicios, historial
   y finanzas en una sola app, con persistencia local.
   ============================================================ */

const STORAGE_KEY = "depila_crm_state_v1";


// -------- Helpers de fechas y formato --------
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysBetween = (aISO, bISO) => {
  if (!aISO || !bISO) return null;
  const a = new Date(aISO), b = new Date(bISO);
  return Math.floor((a - b) / 86400000);
};
const addWeeks = (iso, weeks) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
};
const fmtMoney = (n) => "$" + (Number(n) || 0).toFixed(2);
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateShort = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
};
const fmtTime = (t) => t || "—";
const uid = () => Math.random().toString(36).slice(2, 10);

// -------- Datos iniciales --------
function seedData() {
  const hoy = todayISO();
  const servicios = [
    { id: "s1", nombre: "Bikini clásico", precio: 18, duracion: 20, frecuenciaSemanas: 4, zona: "Bikini", nivelDolor: "Medio", activo: true },
    { id: "s2", nombre: "Bikini brasileño", precio: 28, duracion: 30, frecuenciaSemanas: 4, zona: "Bikini", nivelDolor: "Alto", activo: true },
    { id: "s3", nombre: "Pierna entera", precio: 25, duracion: 40, frecuenciaSemanas: 6, zona: "Piernas", nivelDolor: "Medio", activo: true },
    { id: "s4", nombre: "Media pierna", precio: 15, duracion: 25, frecuenciaSemanas: 5, zona: "Piernas", nivelDolor: "Bajo", activo: true },
    { id: "s5", nombre: "Axilas", precio: 8, duracion: 10, frecuenciaSemanas: 3, zona: "Brazos", nivelDolor: "Medio", activo: true },
    { id: "s6", nombre: "Labio superior", precio: 5, duracion: 5, frecuenciaSemanas: 3, zona: "Facial", nivelDolor: "Alto", activo: true },
    { id: "s7", nombre: "Brazos completos", precio: 18, duracion: 25, frecuenciaSemanas: 5, zona: "Brazos", nivelDolor: "Bajo", activo: true },
  ];

  const clientes = [
    { id: "c1", nombre: "Ana Paredes", telefono: "+593 99 123 4567", cumpleanos: "1992-04-28", tipoPiel: "Sensible", nivelDolorPromedio: "Medio", referidaPorId: null, notas: "Prefiere cera tibia. Alérgica a cítricos." },
    { id: "c2", nombre: "María José Vera", telefono: "+593 98 234 5678", cumpleanos: "1988-11-15", tipoPiel: "Normal", nivelDolorPromedio: "Bajo", referidaPorId: "c1", notas: "Cliente desde 2022." },
    { id: "c3", nombre: "Camila Ortiz", telefono: "+593 97 345 6789", cumpleanos: "1995-07-03", tipoPiel: "Mixta", nivelDolorPromedio: "Alto", referidaPorId: null, notas: "Pide anestésico tópico 20 min antes." },
    { id: "c4", nombre: "Valeria Narváez", telefono: "+593 96 456 7890", cumpleanos: "1990-04-22", tipoPiel: "Con foliculitis", nivelDolorPromedio: "Medio", referidaPorId: "c1", notas: "Foliculitis en bikini; aplicar exfoliante en casa 2x/sem." },
    { id: "c5", nombre: "Sofía Castillo", telefono: "+593 95 567 8901", cumpleanos: "1985-09-10", tipoPiel: "Normal", nivelDolorPromedio: "Bajo", referidaPorId: null, notas: "" },
    { id: "c6", nombre: "Lucía Rodríguez", telefono: "+593 94 678 9012", cumpleanos: "1998-12-02", tipoPiel: "Sensible", nivelDolorPromedio: "Alto", referidaPorId: "c2", notas: "Primera cita fue en enero. En proceso de adaptación." },
  ];

  // Historial: construir visitas con fechas realistas
  const H = [];
  const push = (cId, sId, daysAgo, precio, obs = "", dolor = "😐 Medio") => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - daysAgo);
    H.push({
      id: uid(), clienteId: cId, servicioIds: [sId],
      fecha: fecha.toISOString().slice(0, 10),
      precio, observaciones: obs, nivelDolorReportado: dolor,
      metodoPago: "Transferencia", propina: 0,
    });
  };
  // Ana: cliente frecuente VIP
  push("c1", "s2", 120, 28); push("c1", "s2", 88, 28);
  push("c1", "s3", 56, 25); push("c1", "s2", 32, 28);
  push("c1", "s5", 32, 8); push("c1", "s2", 5, 28, "Piel ligeramente irritada, crema de caléndula.", "😐 Medio");
  // María José
  push("c2", "s1", 95, 18); push("c2", "s4", 60, 15); push("c2", "s1", 32, 18);
  // Camila
  push("c3", "s2", 48, 28, "Dolor alto, aplicar hielo post.", "😣 Alto"); push("c3", "s5", 48, 8);
  // Valeria — inactiva hace tiempo
  push("c4", "s1", 180, 18); push("c4", "s1", 140, 18);
  // Sofía — para contactar ya (🟡)
  push("c5", "s3", 50, 25); push("c5", "s5", 50, 8);
  // Lucía — recién
  push("c6", "s6", 14, 5, "Primera vez, irritación leve esperable.", "😣 Alto");
  push("c6", "s5", 14, 8);

  // Citas futuras y recientes
  const citas = [
    { id: uid(), clienteId: "c1", servicioIds: ["s2"], fechaHora: new Date(Date.now() + 86400000).toISOString().slice(0, 16), estado: "✅ Confirmada", recordatorioEnviado: false, canalReserva: "WhatsApp", notas: "" },
    { id: uid(), clienteId: "c3", servicioIds: ["s2", "s5"], fechaHora: new Date().toISOString().slice(0, 10) + "T15:30", estado: "✅ Confirmada", recordatorioEnviado: true, canalReserva: "Instagram", notas: "Preparar anestésico tópico." },
    { id: uid(), clienteId: "c6", servicioIds: ["s6"], fechaHora: new Date().toISOString().slice(0, 10) + "T10:00", estado: "📅 Pendiente", recordatorioEnviado: false, canalReserva: "WhatsApp", notas: "" },
    { id: uid(), clienteId: "c2", servicioIds: ["s1", "s5"], fechaHora: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16), estado: "✅ Confirmada", recordatorioEnviado: false, canalReserva: "Presencial", notas: "" },
  ];

  // Finanzas
  const finanzas = [];
  H.forEach(v => finanzas.push({
    id: uid(), tipo: "💰 Ingreso", fecha: v.fecha, descripcion: "Servicio",
    monto: v.precio, categoria: "Servicios", metodo: v.metodoPago, clienteId: v.clienteId, esRecurrente: false,
  }));
  const mesActual = todayISO().slice(0, 7);
  finanzas.push({ id: uid(), tipo: "💸 Gasto", fecha: mesActual + "-01", descripcion: "Arriendo local", monto: 350, categoria: "Arriendo", metodo: "Transferencia", clienteId: null, esRecurrente: true });
  finanzas.push({ id: uid(), tipo: "💸 Gasto", fecha: mesActual + "-05", descripcion: "Cera tibia x 5kg", monto: 85, categoria: "Cera", metodo: "Transferencia", clienteId: null, esRecurrente: false });
  finanzas.push({ id: uid(), tipo: "💸 Gasto", fecha: mesActual + "-08", descripcion: "Guantes y espátulas", monto: 28, categoria: "Insumos desechables", metodo: "Efectivo", clienteId: null, esRecurrente: false });
  finanzas.push({ id: uid(), tipo: "💸 Gasto", fecha: mesActual + "-03", descripcion: "Luz y agua", monto: 42, categoria: "Servicios", metodo: "Transferencia", clienteId: null, esRecurrente: true });

  return { servicios, clientes, citas, historial: H, finanzas };
}

// -------- Fórmulas / métricas derivadas --------
function metricsCliente(c, historial, citas) {
  const visitas = historial.filter(h => h.clienteId === c.id);
  const visitasOrd = [...visitas].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultimaVisita = visitasOrd[0]?.fecha || null;
  const totalGastado = visitas.reduce((s, v) => s + Number(v.precio || 0), 0);
  const nVisitas = visitas.length;

  let estado = "🆕 Nueva";
  if (ultimaVisita) {
    const d = daysBetween(todayISO(), ultimaVisita);
    estado = d > 60 ? "💤 Inactiva" : "✅ Activa";
  }

  const frecuente = nVisitas >= 5;

  let nivelVIP = "Regular";
  if (totalGastado >= 500) nivelVIP = "💎 Diamante";
  else if (totalGastado >= 250) nivelVIP = "🥇 Oro";
  else if (totalGastado >= 100) nivelVIP = "🥈 Plata";

  const cumpleEsteMes = c.cumpleanos && c.cumpleanos.slice(5, 7) === todayISO().slice(5, 7);

  // Próxima cita agendada: la primera cita futura confirmada
  const proxAgendada = citas
    .filter(ci => ci.clienteId === c.id && ci.estado === "✅ Confirmada" && ci.fechaHora >= todayISO())
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))[0]?.fechaHora || null;

  return { ultimaVisita, totalGastado, nVisitas, estado, frecuente, nivelVIP, cumpleEsteMes, proxAgendada };
}

function metricsVisita(v, servicios) {
  const svs = servicios.filter(s => v.servicioIds.includes(s.id));
  const freq = svs[0]?.frecuenciaSemanas || 4;
  const proxima = addWeeks(v.fecha, freq);
  const dias = daysBetween(todayISO(), v.fecha);
  const umbral = freq * 7;

  let seguimiento = "⚪ Aún no";
  if (dias > umbral + 14) seguimiento = "🔴 Perdida";
  else if (dias >= umbral) seguimiento = "🟡 Contactar ya";
  else if (dias >= umbral - 7) seguimiento = "🟢 Próxima semana";

  return { proximaSugerida: proxima, diasDesde: dias, seguimiento, servicios: svs };
}

function metricsCita(ci, servicios) {
  const svs = servicios.filter(s => ci.servicioIds.includes(s.id));
  const duracion = svs.reduce((s, x) => s + Number(x.duracion || 0), 0);
  const precio = svs.reduce((s, x) => s + Number(x.precio || 0), 0);
  return { duracion, precio, servicios: svs };
}

/* ============================================================
   Componentes reutilizables
   ============================================================ */

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-[color:var(--chip-bg)] text-[color:var(--ink)]",
    rose: "bg-[color:var(--rose-soft)] text-[color:var(--rose-deep)]",
    sage: "bg-[color:var(--sage-soft)] text-[color:var(--sage-deep)]",
    gold: "bg-[color:var(--gold-soft)] text-[color:var(--gold-deep)]",
    warn: "bg-[#F4E4DA] text-[#8A4A2B]",
    danger: "bg-[#F0D5CF] text-[#8A3524]",
    success: "bg-[#E5EADF] text-[#4A5A3E]",
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${tones[tone]}`}>{children}</span>;
}

function StatCard({ label, value, sub, icon: Icon, tone = "rose" }) {
  const toneBg = { rose: "var(--rose-soft)", sage: "var(--sage-soft)", gold: "var(--gold-soft)", cream: "var(--bg-card)" }[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-[color:var(--border)] bg-[color:var(--bg-card)]">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-60" style={{ background: toneBg }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-[color:var(--ink-soft)]">{label}</span>
          {Icon && <Icon size={16} className="text-[color:var(--ink-soft)]" />}
        </div>
        <div className="font-serif text-3xl text-[color:var(--ink)] leading-none">{value}</div>
        {sub && <div className="mt-2 text-sm text-[color:var(--ink-soft)]">{sub}</div>}
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(42,31,26,0.5)] backdrop-blur-sm" onClick={onClose}>
      <div className={`relative bg-[color:var(--bg-card)] rounded-2xl shadow-2xl border border-[color:var(--border)] ${wide ? "max-w-3xl" : "max-w-lg"} w-full max-h-[90vh] overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)]">
          <h3 className="font-serif text-xl text-[color:var(--ink)]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--chip-bg)] text-[color:var(--ink-soft)]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-widest text-[color:var(--ink-soft)] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-xs text-[color:var(--ink-soft)] italic">{hint}</span>}
    </label>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--rose-deep)] focus:ring-1 focus:ring-[color:var(--rose-deep)] transition";

function Btn({ children, variant = "primary", onClick, icon: Icon, type = "button", small = false }) {
  const base = small ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variants = {
    primary: "bg-[color:var(--rose-deep)] text-[color:var(--bg-card)] hover:opacity-90",
    ghost: "bg-transparent text-[color:var(--ink)] hover:bg-[color:var(--chip-bg)]",
    soft: "bg-[color:var(--rose-soft)] text-[color:var(--rose-deep)] hover:brightness-95",
    danger: "bg-[#F0D5CF] text-[#8A3524] hover:brightness-95",
  };
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg font-medium tracking-wide transition ${base} ${variants[variant]}`}>
      {Icon && <Icon size={small ? 14 : 16} />}
      {children}
    </button>
  );
}

/* ============================================================
   SECCIÓN: Dashboard
   ============================================================ */
function Dashboard({ state, goTo }) {
  const { clientes, citas, historial, finanzas, servicios } = state;
  const hoy = todayISO();
  const mes = hoy.slice(0, 7);

  const citasHoy = citas.filter(c => c.fechaHora.startsWith(hoy)).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  const paraContactar = historial
    .map(v => ({ v, m: metricsVisita(v, servicios), cli: clientes.find(c => c.id === v.clienteId) }))
    .filter(x => x.m.seguimiento === "🟡 Contactar ya" && x.cli)
    // Agrupar por cliente: solo la visita más reciente
    .reduce((acc, x) => {
      const prev = acc.find(a => a.cli.id === x.cli.id);
      if (!prev || prev.v.fecha < x.v.fecha) {
        return acc.filter(a => a.cli.id !== x.cli.id).concat(x);
      }
      return acc;
    }, []);

  const ingresosMes = finanzas.filter(f => f.tipo === "💰 Ingreso" && f.fecha.startsWith(mes)).reduce((s, f) => s + Number(f.monto), 0);
  const gastosMes = finanzas.filter(f => f.tipo === "💸 Gasto" && f.fecha.startsWith(mes)).reduce((s, f) => s + Number(f.monto), 0);
  const ganancia = ingresosMes - gastosMes;

  const cumpleañeras = clientes.filter(c => c.cumpleanos && c.cumpleanos.slice(5, 7) === hoy.slice(5, 7));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
          {new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--ink)] mt-1 italic">
          Buenos días, <span className="not-italic">bella.</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Citas hoy" value={citasHoy.length} sub={citasHoy.length ? `primera: ${citasHoy[0].fechaHora.slice(11)}` : "día libre"} icon={Calendar} tone="rose" />
        <StatCard label="Para contactar" value={paraContactar.length} sub="clientas a reagendar" icon={MessageCircle} tone="gold" />
        <StatCard label="Ingresos del mes" value={fmtMoney(ingresosMes)} sub={`ganancia: ${fmtMoney(ganancia)}`} icon={TrendingUp} tone="sage" />
        <StatCard label="Cumpleañeras" value={cumpleañeras.length} sub="este mes" icon={Cake} tone="cream" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-[color:var(--ink)]">Agenda de hoy</h2>
            <button onClick={() => goTo("citas")} className="text-sm text-[color:var(--rose-deep)] hover:underline flex items-center gap-1">ver todas <ChevronRight size={14} /></button>
          </div>
          {citasHoy.length === 0 ? (
            <p className="text-[color:var(--ink-soft)] italic">Hoy no hay citas. Tiempo para ti ✨</p>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {citasHoy.map(ci => {
                const cli = clientes.find(c => c.id === ci.clienteId);
                const m = metricsCita(ci, servicios);
                return (
                  <li key={ci.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg text-[color:var(--ink)]">{ci.fechaHora.slice(11)}</span>
                        <span className="text-[color:var(--ink-soft)]">·</span>
                        <span className="text-[color:var(--ink)] font-medium">{cli?.nombre}</span>
                      </div>
                      <div className="text-sm text-[color:var(--ink-soft)] mt-0.5">
                        {m.servicios.map(s => s.nombre).join(" + ")} · {m.duracion} min · {fmtMoney(m.precio)}
                      </div>
                    </div>
                    <Badge tone={ci.estado === "✅ Confirmada" ? "success" : "warn"}>{ci.estado}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Para contactar */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-[color:var(--ink)]">Para contactar</h2>
            <button onClick={() => goTo("historial")} className="text-sm text-[color:var(--rose-deep)] hover:underline flex items-center gap-1">ver todas <ChevronRight size={14} /></button>
          </div>
          {paraContactar.length === 0 ? (
            <p className="text-[color:var(--ink-soft)] italic">Nadie pendiente de reagendar. Vas al día 💚</p>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {paraContactar.slice(0, 5).map(({ v, cli, m }) => (
                <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[color:var(--ink)]">{cli.nombre}</div>
                    <div className="text-sm text-[color:var(--ink-soft)] mt-0.5">
                      última visita hace {m.diasDesde} días · {m.servicios[0]?.nombre}
                    </div>
                  </div>
                  <Badge tone="warn">🟡 Contactar</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {cumpleañeras.length > 0 && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--rose-soft)] to-[color:var(--gold-soft)] p-6">
          <div className="flex items-center gap-2 mb-3"><Cake size={20} className="text-[color:var(--rose-deep)]" /><h2 className="font-serif text-2xl text-[color:var(--ink)]">Cumpleañeras del mes</h2></div>
          <div className="flex flex-wrap gap-2">
            {cumpleañeras.map(c => (
              <span key={c.id} className="px-3 py-1.5 rounded-full bg-[color:var(--bg-card)] text-sm text-[color:var(--ink)] border border-[color:var(--border)]">
                {c.nombre} · {fmtDateShort(c.cumpleanos)}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-[color:var(--ink-soft)] italic">Envíales un mensaje con un detalle especial este mes.</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SECCIÓN: Clientes
   ============================================================ */
function ClientesView({ state, setState }) {
  const { clientes, historial, citas } = state;
  const [vista, setVista] = useState("todas");
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState(null);
  const [verCliente, setVerCliente] = useState(null);

  const enriched = useMemo(() =>
    clientes.map(c => ({ ...c, ...metricsCliente(c, historial, citas) })), [clientes, historial, citas]);

  const filtrados = useMemo(() => {
    let arr = enriched;
    if (vista === "vip") arr = [...arr].filter(c => c.totalGastado > 0).sort((a, b) => b.totalGastado - a.totalGastado).slice(0, 20);
    if (vista === "inactivas") arr = arr.filter(c => c.estado === "💤 Inactiva");
    if (vista === "cumples") arr = arr.filter(c => c.cumpleEsteMes);
    if (vista === "nuevas") arr = arr.filter(c => c.estado === "🆕 Nueva");
    if (q) arr = arr.filter(c => c.nombre.toLowerCase().includes(q.toLowerCase()));
    return arr;
  }, [enriched, vista, q]);

  const save = (data) => {
    setState(s => {
      const existe = s.clientes.find(c => c.id === data.id);
      return { ...s, clientes: existe ? s.clientes.map(c => c.id === data.id ? data : c) : [...s.clientes, data] };
    });
    setEditando(null);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar esta clienta? Su historial quedará huérfano.")) return;
    setState(s => ({ ...s, clientes: s.clientes.filter(c => c.id !== id) }));
    setVerCliente(null);
  };

  const vistas = [
    { id: "todas", label: "Todas", n: enriched.length },
    { id: "vip", label: "⭐ VIP", n: Math.min(20, enriched.filter(c => c.totalGastado > 0).length) },
    { id: "inactivas", label: "💤 Inactivas", n: enriched.filter(c => c.estado === "💤 Inactiva").length },
    { id: "cumples", label: "🎂 Cumples del mes", n: enriched.filter(c => c.cumpleEsteMes).length },
    { id: "nuevas", label: "🆕 Nuevas", n: enriched.filter(c => c.estado === "🆕 Nueva").length },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-[color:var(--ink)] italic">Clientas</h1>
          <p className="text-[color:var(--ink-soft)] mt-1">El corazón del negocio.</p>
        </div>
        <Btn icon={Plus} onClick={() => setEditando({ id: uid(), nombre: "", telefono: "", cumpleanos: "", tipoPiel: "Normal", nivelDolorPromedio: "Medio", referidaPorId: null, notas: "" })}>Nueva clienta</Btn>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {vistas.map(v => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${vista === v.id ? "bg-[color:var(--ink)] text-[color:var(--bg-card)] border-[color:var(--ink)]" : "bg-[color:var(--bg-card)] text-[color:var(--ink)] border-[color:var(--border)] hover:border-[color:var(--ink-soft)]"}`}>
            {v.label} <span className="opacity-60 ml-1">{v.n}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--ink-soft)]" />
        <input placeholder="Buscar por nombre..." value={q} onChange={e => setQ(e.target.value)} className={`${inputCls} pl-9`} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(c => (
          <div key={c.id} onClick={() => setVerCliente(c)} className="p-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] cursor-pointer hover:border-[color:var(--rose-deep)] transition group">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl text-[color:var(--ink)]">{c.nombre}</h3>
                <p className="text-sm text-[color:var(--ink-soft)] mt-0.5">{c.telefono}</p>
              </div>
              {c.cumpleEsteMes && <span className="text-xl">🎂</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge tone={c.estado === "✅ Activa" ? "success" : c.estado === "💤 Inactiva" ? "danger" : "neutral"}>{c.estado}</Badge>
              {c.nivelVIP !== "Regular" && <Badge tone="gold">{c.nivelVIP}</Badge>}
              {c.frecuente && <Badge tone="rose">⭐ frecuente</Badge>}
            </div>
            <div className="mt-4 pt-4 border-t border-[color:var(--border)] flex justify-between text-sm">
              <div><span className="text-[color:var(--ink-soft)]">Gastado</span> <span className="font-medium text-[color:var(--ink)] ml-1">{fmtMoney(c.totalGastado)}</span></div>
              <div><span className="text-[color:var(--ink-soft)]">Visitas</span> <span className="font-medium text-[color:var(--ink)] ml-1">{c.nVisitas}</span></div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && <div className="col-span-full text-center py-12 text-[color:var(--ink-soft)] italic">Sin resultados en esta vista.</div>}
      </div>

      {/* Modal ver cliente */}
      <Modal open={!!verCliente} onClose={() => setVerCliente(null)} title={verCliente?.nombre || ""} wide>
        {verCliente && (() => {
          const c = enriched.find(x => x.id === verCliente.id);
          if (!c) return null;
          const visitas = historial.filter(h => h.clienteId === c.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
          const referida = c.referidaPorId ? clientes.find(x => x.id === c.referidaPorId) : null;
          return (
            <div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge tone={c.estado === "✅ Activa" ? "success" : c.estado === "💤 Inactiva" ? "danger" : "neutral"}>{c.estado}</Badge>
                {c.nivelVIP !== "Regular" && <Badge tone="gold">{c.nivelVIP}</Badge>}
                {c.frecuente && <Badge tone="rose">⭐ frecuente</Badge>}
                {c.cumpleEsteMes && <Badge tone="rose">🎂 cumple este mes</Badge>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
                <div><Phone size={14} className="inline mr-1.5 text-[color:var(--ink-soft)]" />{c.telefono || "—"}</div>
                <div><Cake size={14} className="inline mr-1.5 text-[color:var(--ink-soft)]" />{fmtDate(c.cumpleanos)}</div>
                <div><Droplet size={14} className="inline mr-1.5 text-[color:var(--ink-soft)]" />Piel: {c.tipoPiel}</div>
                <div><Flame size={14} className="inline mr-1.5 text-[color:var(--ink-soft)]" />Dolor: {c.nivelDolorPromedio}</div>
                {referida && <div className="sm:col-span-2"><Heart size={14} className="inline mr-1.5 text-[color:var(--ink-soft)]" />Referida por {referida.nombre}</div>}
              </div>

              {c.notas && (
                <div className="mb-5 p-3 rounded-lg bg-[color:var(--chip-bg)] border border-[color:var(--border)]">
                  <div className="text-xs uppercase tracking-widest text-[color:var(--ink-soft)] mb-1">Notas privadas</div>
                  <p className="text-sm text-[color:var(--ink)]">{c.notas}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-5">
                <StatCard label="Total gastado" value={fmtMoney(c.totalGastado)} tone="rose" />
                <StatCard label="Visitas" value={c.nVisitas} tone="sage" />
                <StatCard label="Última" value={c.ultimaVisita ? fmtDateShort(c.ultimaVisita) : "—"} tone="cream" />
              </div>

              <h4 className="font-serif text-lg text-[color:var(--ink)] mb-2">Historial</h4>
              {visitas.length === 0 ? (
                <p className="text-[color:var(--ink-soft)] italic text-sm">Aún sin visitas.</p>
              ) : (
                <ul className="divide-y divide-[color:var(--border)] text-sm">
                  {visitas.map(v => {
                    const m = metricsVisita(v, state.servicios);
                    return (
                      <li key={v.id} className="py-2.5">
                        <div className="flex justify-between">
                          <span className="font-medium">{fmtDate(v.fecha)} · {m.servicios.map(s => s.nombre).join(", ")}</span>
                          <span>{fmtMoney(v.precio)}</span>
                        </div>
                        {v.observaciones && <p className="text-xs text-[color:var(--ink-soft)] mt-0.5 italic">{v.observaciones}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex justify-between mt-6 pt-4 border-t border-[color:var(--border)]">
                <Btn variant="danger" icon={Trash2} onClick={() => eliminar(c.id)}>Eliminar</Btn>
                <Btn icon={Pencil} onClick={() => { setEditando(c); setVerCliente(null); }}>Editar</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal editar cliente */}
      <Modal open={!!editando} onClose={() => setEditando(null)} title={editando?.nombre ? `Editar ${editando.nombre}` : "Nueva clienta"}>
        {editando && (
          <form onSubmit={e => { e.preventDefault(); save(editando); }}>
            <Field label="Nombre"><input required className={inputCls} value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} /></Field>
            <Field label="Teléfono"><input className={inputCls} value={editando.telefono} onChange={e => setEditando({ ...editando, telefono: e.target.value })} /></Field>
            <Field label="Cumpleaños"><input type="date" className={inputCls} value={editando.cumpleanos || ""} onChange={e => setEditando({ ...editando, cumpleanos: e.target.value })} /></Field>
            <Field label="Tipo de piel">
              <select className={inputCls} value={editando.tipoPiel} onChange={e => setEditando({ ...editando, tipoPiel: e.target.value })}>
                {["Sensible", "Normal", "Mixta", "Grasa", "Con foliculitis"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Nivel de dolor promedio">
              <select className={inputCls} value={editando.nivelDolorPromedio} onChange={e => setEditando({ ...editando, nivelDolorPromedio: e.target.value })}>
                {["Bajo", "Medio", "Alto", "Muy alto"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Referida por">
              <select className={inputCls} value={editando.referidaPorId || ""} onChange={e => setEditando({ ...editando, referidaPorId: e.target.value || null })}>
                <option value="">— Nadie —</option>
                {clientes.filter(c => c.id !== editando.id).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Notas privadas" hint="Alergias, preferencias, detalles clave.">
              <textarea rows={3} className={inputCls} value={editando.notas} onChange={e => setEditando({ ...editando, notas: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 mt-2"><Btn variant="ghost" onClick={() => setEditando(null)}>Cancelar</Btn><Btn type="submit">Guardar</Btn></div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   SECCIÓN: Citas
   ============================================================ */
function CitasView({ state, setState }) {
  const { citas, clientes, servicios } = state;
  const [vista, setVista] = useState("hoy");
  const [editando, setEditando] = useState(null);
  const hoy = todayISO();

  const enriched = citas.map(ci => {
    const cli = clientes.find(c => c.id === ci.clienteId);
    return { ...ci, cli, ...metricsCita(ci, servicios) };
  }).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  const filtrados = useMemo(() => {
    if (vista === "hoy") return enriched.filter(c => c.fechaHora.startsWith(hoy));
    if (vista === "manana") { const t = new Date(); t.setDate(t.getDate() + 1); return enriched.filter(c => c.fechaHora.startsWith(t.toISOString().slice(0, 10))); }
    if (vista === "semana") { const fin = new Date(); fin.setDate(fin.getDate() + 7); return enriched.filter(c => c.fechaHora >= hoy && c.fechaHora <= fin.toISOString().slice(0, 10) + "T23:59"); }
    if (vista === "pendientes") return enriched.filter(c => c.estado === "📅 Pendiente" && c.fechaHora >= hoy);
    if (vista === "todas") return enriched;
    return enriched;
  }, [enriched, vista, hoy]);

  const vistas = [
    { id: "hoy", label: "📆 Hoy" },
    { id: "manana", label: "➡️ Mañana" },
    { id: "semana", label: "🗓️ Próx. 7 días" },
    { id: "pendientes", label: "⏳ Por confirmar" },
    { id: "todas", label: "Todas" },
  ];

  const save = (data) => {
    setState(s => ({ ...s, citas: s.citas.find(c => c.id === data.id) ? s.citas.map(c => c.id === data.id ? data : c) : [...s.citas, data] }));
    setEditando(null);
  };

  const cambiarEstado = (cita, estado) => {
    if (estado === "✔️ Completada") {
      // Crear registro en Historial y en Finanzas automáticamente
      const m = metricsCita(cita, servicios);
      const nueva = {
        id: uid(), clienteId: cita.clienteId, servicioIds: cita.servicioIds,
        fecha: cita.fechaHora.slice(0, 10), precio: m.precio,
        observaciones: "", nivelDolorReportado: "😐 Medio",
        metodoPago: "Efectivo", propina: 0,
      };
      const nuevaFin = {
        id: uid(), tipo: "💰 Ingreso", fecha: nueva.fecha,
        descripcion: "Servicio", monto: m.precio, categoria: "Servicios",
        metodo: "Efectivo", clienteId: cita.clienteId, esRecurrente: false,
      };
      setState(s => ({
        ...s,
        citas: s.citas.map(c => c.id === cita.id ? { ...c, estado } : c),
        historial: [...s.historial, nueva],
        finanzas: [...s.finanzas, nuevaFin],
      }));
      alert("✔️ Cita completada. Se creó el registro en Historial y Finanzas automáticamente.");
    } else {
      setState(s => ({ ...s, citas: s.citas.map(c => c.id === cita.id ? { ...c, estado } : c) }));
    }
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    setState(s => ({ ...s, citas: s.citas.filter(c => c.id !== id) }));
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-[color:var(--ink)] italic">Agenda</h1>
          <p className="text-[color:var(--ink-soft)] mt-1">Tu día, ordenado.</p>
        </div>
        <Btn icon={Plus} onClick={() => setEditando({ id: uid(), clienteId: "", servicioIds: [], fechaHora: hoy + "T10:00", estado: "📅 Pendiente", recordatorioEnviado: false, canalReserva: "WhatsApp", notas: "" })}>Nueva cita</Btn>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {vistas.map(v => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${vista === v.id ? "bg-[color:var(--ink)] text-[color:var(--bg-card)] border-[color:var(--ink)]" : "bg-[color:var(--bg-card)] text-[color:var(--ink)] border-[color:var(--border)] hover:border-[color:var(--ink-soft)]"}`}>
            {v.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[color:var(--border)] text-[color:var(--ink-soft)] italic">Sin citas en esta vista.</div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(ci => (
            <div key={ci.id} className="p-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)] hover:border-[color:var(--rose-deep)] transition">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <div className="font-serif text-2xl text-[color:var(--ink)] leading-none">{ci.fechaHora.slice(11)}</div>
                    <div className="text-xs uppercase tracking-wider text-[color:var(--ink-soft)] mt-1">{fmtDateShort(ci.fechaHora.slice(0, 10))}</div>
                  </div>
                  <div className="w-px h-10 bg-[color:var(--border)]" />
                  <div>
                    <div className="font-medium text-[color:var(--ink)]">{ci.cli?.nombre || "—"}</div>
                    <div className="text-sm text-[color:var(--ink-soft)]">{ci.servicios.map(s => s.nombre).join(" + ") || "Sin servicio"} · {ci.duracion} min · {fmtMoney(ci.precio)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={ci.estado === "✅ Confirmada" ? "success" : ci.estado === "❌ Cancelada" ? "danger" : ci.estado === "✔️ Completada" ? "sage" : "warn"}>{ci.estado}</Badge>
                  <select value={ci.estado} onChange={e => cambiarEstado(ci, e.target.value)} className="text-xs px-2 py-1 rounded-md border border-[color:var(--border)] bg-[color:var(--bg)]">
                    {["📅 Pendiente", "✅ Confirmada", "❌ Cancelada", "👻 No asistió", "✔️ Completada"].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setEditando(ci)} className="p-1.5 rounded-md hover:bg-[color:var(--chip-bg)]"><Pencil size={14} /></button>
                  <button onClick={() => eliminar(ci.id)} className="p-1.5 rounded-md hover:bg-[#F0D5CF] text-[#8A3524]"><Trash2 size={14} /></button>
                </div>
              </div>
              {ci.notas && <p className="mt-2 text-sm text-[color:var(--ink-soft)] italic pl-[90px]">“{ci.notas}”</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editando} onClose={() => setEditando(null)} title={citas.find(c => c.id === editando?.id) ? "Editar cita" : "Nueva cita"}>
        {editando && (
          <form onSubmit={e => { e.preventDefault(); save(editando); }}>
            <Field label="Clienta">
              <select required className={inputCls} value={editando.clienteId} onChange={e => setEditando({ ...editando, clienteId: e.target.value })}>
                <option value="">— Elegir —</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Servicio(s)" hint="Ctrl/Cmd + clic para seleccionar varios.">
              <select multiple size={5} className={inputCls} value={editando.servicioIds} onChange={e => setEditando({ ...editando, servicioIds: Array.from(e.target.selectedOptions).map(o => o.value) })}>
                {servicios.filter(s => s.activo).map(s => <option key={s.id} value={s.id}>{s.nombre} — {fmtMoney(s.precio)} · {s.duracion} min</option>)}
              </select>
            </Field>
            <Field label="Fecha y hora"><input type="datetime-local" required className={inputCls} value={editando.fechaHora} onChange={e => setEditando({ ...editando, fechaHora: e.target.value })} /></Field>
            <Field label="Estado">
              <select className={inputCls} value={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.value })}>
                {["📅 Pendiente", "✅ Confirmada", "❌ Cancelada", "👻 No asistió", "✔️ Completada"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Canal de reserva">
              <select className={inputCls} value={editando.canalReserva} onChange={e => setEditando({ ...editando, canalReserva: e.target.value })}>
                {["WhatsApp", "Instagram", "Presencial", "Referida", "Otro"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Notas"><textarea rows={2} className={inputCls} value={editando.notas} onChange={e => setEditando({ ...editando, notas: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 mt-2"><Btn variant="ghost" onClick={() => setEditando(null)}>Cancelar</Btn><Btn type="submit">Guardar</Btn></div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   SECCIÓN: Servicios
   ============================================================ */
function ServiciosView({ state, setState }) {
  const { servicios, historial } = state;
  const [editando, setEditando] = useState(null);

  const enriched = servicios.map(s => {
    const vs = historial.filter(h => h.servicioIds.includes(s.id));
    const veces = vs.length;
    const ingresos = vs.reduce((sum, v) => {
      // Prorrateo si hay múltiples servicios en la visita: asigna precio completo del servicio
      const svs = servicios.filter(x => v.servicioIds.includes(x.id));
      const total = svs.reduce((a, b) => a + b.precio, 0);
      return sum + (total > 0 ? (s.precio / total) * v.precio : 0);
    }, 0);
    let pop = "🌱 Nueva";
    if (veces >= 50) pop = "🔥🔥🔥 Top";
    else if (veces >= 20) pop = "🔥🔥 Alta";
    else if (veces >= 5) pop = "🔥 Media";
    return { ...s, veces, ingresos, pop, precioPorMin: s.duracion ? s.precio / s.duracion : 0 };
  });

  const save = (d) => {
    setState(s => ({ ...s, servicios: s.servicios.find(x => x.id === d.id) ? s.servicios.map(x => x.id === d.id ? d : x) : [...s.servicios, d] }));
    setEditando(null);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar este servicio? El historial antiguo seguirá existiendo.")) return;
    setState(s => ({ ...s, servicios: s.servicios.filter(x => x.id !== id) }));
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-[color:var(--ink)] italic">Servicios</h1>
          <p className="text-[color:var(--ink-soft)] mt-1">Tu carta y sus márgenes.</p>
        </div>
        <Btn icon={Plus} onClick={() => setEditando({ id: uid(), nombre: "", precio: 0, duracion: 20, frecuenciaSemanas: 4, zona: "Bikini", nivelDolor: "Medio", activo: true })}>Nuevo servicio</Btn>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)]">
        <table className="w-full text-sm">
          <thead className="text-left uppercase tracking-widest text-xs text-[color:var(--ink-soft)]">
            <tr className="border-b border-[color:var(--border)]">
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Duración</th>
              <th className="px-4 py-3">$ / min</th>
              <th className="px-4 py-3">Frecuencia</th>
              <th className="px-4 py-3">Veces</th>
              <th className="px-4 py-3">Ingresos</th>
              <th className="px-4 py-3">Popularidad</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {enriched.sort((a, b) => b.ingresos - a.ingresos).map(s => (
              <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--chip-bg)]">
                <td className="px-4 py-3">
                  <div className="font-medium text-[color:var(--ink)]">{s.nombre} {!s.activo && <span className="text-xs text-[color:var(--ink-soft)]">(inactivo)</span>}</div>
                  <div className="text-xs text-[color:var(--ink-soft)]">{s.zona} · dolor {s.nivelDolor}</div>
                </td>
                <td className="px-4 py-3">{fmtMoney(s.precio)}</td>
                <td className="px-4 py-3">{s.duracion} min</td>
                <td className="px-4 py-3">{fmtMoney(s.precioPorMin)}</td>
                <td className="px-4 py-3">{s.frecuenciaSemanas} sem</td>
                <td className="px-4 py-3">{s.veces}</td>
                <td className="px-4 py-3">{fmtMoney(s.ingresos)}</td>
                <td className="px-4 py-3 text-xs">{s.pop}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditando(s)} className="p-1.5 rounded-md hover:bg-[color:var(--chip-bg)]"><Pencil size={14} /></button>
                  <button onClick={() => eliminar(s.id)} className="p-1.5 rounded-md hover:bg-[#F0D5CF] text-[#8A3524] ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)} title={servicios.find(s => s.id === editando?.id) ? "Editar servicio" : "Nuevo servicio"}>
        {editando && (
          <form onSubmit={e => { e.preventDefault(); save(editando); }}>
            <Field label="Nombre"><input required className={inputCls} value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio"><input type="number" step="0.01" className={inputCls} value={editando.precio} onChange={e => setEditando({ ...editando, precio: Number(e.target.value) })} /></Field>
              <Field label="Duración (min)"><input type="number" className={inputCls} value={editando.duracion} onChange={e => setEditando({ ...editando, duracion: Number(e.target.value) })} /></Field>
              <Field label="Frecuencia (sem)"><input type="number" className={inputCls} value={editando.frecuenciaSemanas} onChange={e => setEditando({ ...editando, frecuenciaSemanas: Number(e.target.value) })} /></Field>
              <Field label="Zona">
                <select className={inputCls} value={editando.zona} onChange={e => setEditando({ ...editando, zona: e.target.value })}>
                  {["Facial", "Brazos", "Piernas", "Bikini", "Torso"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Nivel de dolor">
                <select className={inputCls} value={editando.nivelDolor} onChange={e => setEditando({ ...editando, nivelDolor: e.target.value })}>
                  {["Bajo", "Medio", "Alto"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Activo">
                <select className={inputCls} value={editando.activo ? "si" : "no"} onChange={e => setEditando({ ...editando, activo: e.target.value === "si" })}>
                  <option value="si">Sí</option><option value="no">No</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-2"><Btn variant="ghost" onClick={() => setEditando(null)}>Cancelar</Btn><Btn type="submit">Guardar</Btn></div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   SECCIÓN: Historial
   ============================================================ */
function HistorialView({ state, setState }) {
  const { historial, clientes, servicios } = state;
  const [vista, setVista] = useState("contactar");
  const [editando, setEditando] = useState(null);

  const enriched = historial.map(v => ({
    ...v,
    cli: clientes.find(c => c.id === v.clienteId),
    ...metricsVisita(v, servicios),
  })).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const filtrados = useMemo(() => {
    if (vista === "contactar") {
      // Solo la visita más reciente por cliente que está en 🟡
      const porCliente = new Map();
      enriched.forEach(v => { if (!porCliente.has(v.clienteId)) porCliente.set(v.clienteId, v); });
      return [...porCliente.values()].filter(v => v.seguimiento === "🟡 Contactar ya");
    }
    if (vista === "riesgo") {
      const porCliente = new Map();
      enriched.forEach(v => { if (!porCliente.has(v.clienteId)) porCliente.set(v.clienteId, v); });
      return [...porCliente.values()].filter(v => v.seguimiento === "🔴 Perdida");
    }
    if (vista === "semana") return enriched.filter(v => daysBetween(todayISO(), v.fecha) <= 7 && daysBetween(todayISO(), v.fecha) >= 0);
    if (vista === "reacciones") return enriched.filter(v => v.observaciones && v.observaciones.trim());
    return enriched;
  }, [enriched, vista]);

  const save = (d) => {
    setState(s => ({ ...s, historial: s.historial.find(x => x.id === d.id) ? s.historial.map(x => x.id === d.id ? d : x) : [...s.historial, d] }));
    setEditando(null);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar este registro del historial? Los rollups del cliente cambiarán.")) return;
    setState(s => ({ ...s, historial: s.historial.filter(x => x.id !== id) }));
  };

  const vistas = [
    { id: "contactar", label: "🟡 Para contactar ya" },
    { id: "riesgo", label: "🔴 En riesgo" },
    { id: "semana", label: "📅 Esta semana" },
    { id: "reacciones", label: "⚠️ Con observaciones" },
    { id: "todas", label: "Todas" },
  ];

  const msgTemplate = (v) => {
    const nombre = v.cli?.nombre?.split(" ")[0] || "";
    const servicio = v.servicios[0]?.nombre || "tu servicio";
    const freq = v.servicios[0]?.frecuenciaSemanas || 4;
    return `Hola ${nombre} 💗 Noté que ya pasó tu ciclo ideal de ${servicio} (hace ${v.diasDesde} días). Para mantener ese acabado suave, lo ideal es no pasar las ${freq} semanas. Tengo disponibilidad esta semana, ¿qué día te acomoda?`;
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-[color:var(--ink)] italic">Historial</h1>
          <p className="text-[color:var(--ink-soft)] mt-1">La mina de oro: cada visita es inteligencia para el negocio.</p>
        </div>
        <Btn icon={Plus} onClick={() => setEditando({ id: uid(), clienteId: "", servicioIds: [], fecha: todayISO(), precio: 0, observaciones: "", nivelDolorReportado: "😐 Medio", metodoPago: "Efectivo", propina: 0 })}>Nuevo registro</Btn>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {vistas.map(v => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${vista === v.id ? "bg-[color:var(--ink)] text-[color:var(--bg-card)] border-[color:var(--ink)]" : "bg-[color:var(--bg-card)] text-[color:var(--ink)] border-[color:var(--border)] hover:border-[color:var(--ink-soft)]"}`}>
            {v.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[color:var(--border)] text-[color:var(--ink-soft)] italic">Sin registros en esta vista.</div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(v => (
            <div key={v.id} className="p-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[color:var(--ink)]">{v.cli?.nombre || "—"}</span>
                    <span className="text-[color:var(--ink-soft)]">·</span>
                    <span className="text-sm text-[color:var(--ink-soft)]">{fmtDate(v.fecha)}</span>
                    <Badge tone={v.seguimiento.startsWith("🔴") ? "danger" : v.seguimiento.startsWith("🟡") ? "warn" : v.seguimiento.startsWith("🟢") ? "success" : "neutral"}>{v.seguimiento}</Badge>
                  </div>
                  <div className="text-sm text-[color:var(--ink-soft)] mt-1">
                    {v.servicios.map(s => s.nombre).join(" + ")} · {fmtMoney(v.precio)} · dolor {v.nivelDolorReportado}
                  </div>
                  <div className="text-xs text-[color:var(--ink-soft)] mt-1">
                    Próxima sugerida: <span className="text-[color:var(--ink)] font-medium">{fmtDate(v.proximaSugerida)}</span>
                  </div>
                  {v.observaciones && <p className="mt-2 text-sm italic text-[color:var(--ink-soft)]">“{v.observaciones}”</p>}
                  {(vista === "contactar" || vista === "riesgo") && (
                    <div className="mt-3 p-3 rounded-lg bg-[color:var(--chip-bg)] border border-[color:var(--border)]">
                      <div className="text-xs uppercase tracking-widest text-[color:var(--ink-soft)] mb-1.5">📲 Mensaje sugerido</div>
                      <p className="text-sm text-[color:var(--ink)]">{msgTemplate(v)}</p>
                      <button onClick={() => { navigator.clipboard.writeText(msgTemplate(v)); alert("Copiado al portapapeles ✨"); }} className="mt-2 text-xs text-[color:var(--rose-deep)] hover:underline">Copiar mensaje</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditando(v)} className="p-1.5 rounded-md hover:bg-[color:var(--chip-bg)]"><Pencil size={14} /></button>
                  <button onClick={() => eliminar(v.id)} className="p-1.5 rounded-md hover:bg-[#F0D5CF] text-[#8A3524]"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editando} onClose={() => setEditando(null)} title={historial.find(h => h.id === editando?.id) ? "Editar visita" : "Nueva visita"}>
        {editando && (
          <form onSubmit={e => { e.preventDefault(); save(editando); }}>
            <Field label="Clienta">
              <select required className={inputCls} value={editando.clienteId} onChange={e => setEditando({ ...editando, clienteId: e.target.value })}>
                <option value="">— Elegir —</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Servicio(s)">
              <select multiple size={5} className={inputCls} value={editando.servicioIds} onChange={e => setEditando({ ...editando, servicioIds: Array.from(e.target.selectedOptions).map(o => o.value) })}>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha"><input type="date" required className={inputCls} value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} /></Field>
              <Field label="Precio cobrado"><input type="number" step="0.01" className={inputCls} value={editando.precio} onChange={e => setEditando({ ...editando, precio: Number(e.target.value) })} /></Field>
              <Field label="Dolor reportado">
                <select className={inputCls} value={editando.nivelDolorReportado} onChange={e => setEditando({ ...editando, nivelDolorReportado: e.target.value })}>
                  {["😊 Bajo", "😐 Medio", "😣 Alto", "😫 Muy alto"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Método de pago">
                <select className={inputCls} value={editando.metodoPago} onChange={e => setEditando({ ...editando, metodoPago: e.target.value })}>
                  {["Efectivo", "Transferencia", "Tarjeta"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Observaciones" hint="Reacciones, comentarios, evolución."><textarea rows={3} className={inputCls} value={editando.observaciones} onChange={e => setEditando({ ...editando, observaciones: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 mt-2"><Btn variant="ghost" onClick={() => setEditando(null)}>Cancelar</Btn><Btn type="submit">Guardar</Btn></div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   SECCIÓN: Finanzas
   ============================================================ */
function FinanzasView({ state, setState }) {
  const { finanzas, clientes } = state;
  const [vista, setVista] = useState("mes");
  const [editando, setEditando] = useState(null);
  const mes = todayISO().slice(0, 7);

  const filtrados = useMemo(() => {
    let arr = [...finanzas].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (vista === "mes") arr = arr.filter(f => f.fecha.startsWith(mes));
    if (vista === "ingresos") arr = arr.filter(f => f.tipo === "💰 Ingreso");
    if (vista === "gastos") arr = arr.filter(f => f.tipo === "💸 Gasto");
    if (vista === "recurrentes") arr = arr.filter(f => f.esRecurrente);
    return arr;
  }, [finanzas, vista, mes]);

  const ingresosMes = finanzas.filter(f => f.tipo === "💰 Ingreso" && f.fecha.startsWith(mes)).reduce((s, f) => s + Number(f.monto), 0);
  const gastosMes = finanzas.filter(f => f.tipo === "💸 Gasto" && f.fecha.startsWith(mes)).reduce((s, f) => s + Number(f.monto), 0);
  const margen = ingresosMes > 0 ? ((ingresosMes - gastosMes) / ingresosMes) * 100 : 0;

  // Gastos por categoría (mes)
  const catMap = {};
  finanzas.filter(f => f.tipo === "💸 Gasto" && f.fecha.startsWith(mes)).forEach(f => {
    catMap[f.categoria] = (catMap[f.categoria] || 0) + Number(f.monto);
  });
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  const save = (d) => {
    setState(s => ({ ...s, finanzas: s.finanzas.find(x => x.id === d.id) ? s.finanzas.map(x => x.id === d.id ? d : x) : [...s.finanzas, d] }));
    setEditando(null);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    setState(s => ({ ...s, finanzas: s.finanzas.filter(x => x.id !== id) }));
  };

  const vistas = [
    { id: "mes", label: "📅 Este mes" },
    { id: "ingresos", label: "💰 Solo ingresos" },
    { id: "gastos", label: "💸 Solo gastos" },
    { id: "recurrentes", label: "🔁 Gastos fijos" },
    { id: "todas", label: "Todo" },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-4xl text-[color:var(--ink)] italic">Finanzas</h1>
          <p className="text-[color:var(--ink-soft)] mt-1">Números reales. Sin cuentos.</p>
        </div>
        <Btn icon={Plus} onClick={() => setEditando({ id: uid(), tipo: "💸 Gasto", fecha: todayISO(), descripcion: "", monto: 0, categoria: "Cera", metodo: "Efectivo", clienteId: null, esRecurrente: false })}>Nuevo movimiento</Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Ingresos del mes" value={fmtMoney(ingresosMes)} icon={TrendingUp} tone="sage" />
        <StatCard label="Gastos del mes" value={fmtMoney(gastosMes)} icon={TrendingDown} tone="rose" />
        <StatCard label="Ganancia neta" value={fmtMoney(ingresosMes - gastosMes)} tone="gold" />
        <StatCard label="Margen" value={margen.toFixed(0) + "%"} sub="> 40% ideal" tone="cream" />
      </div>

      {cats.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)]">
          <h3 className="font-serif text-lg text-[color:var(--ink)] mb-3">Gastos por categoría (este mes)</h3>
          <div className="space-y-2">
            {cats.map(([cat, val]) => {
              const pct = (val / gastosMes) * 100;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[color:var(--ink)]">{cat}</span>
                    <span className="text-[color:var(--ink-soft)]">{fmtMoney(val)} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-[color:var(--chip-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-[color:var(--rose-deep)] rounded-full" style={{ width: pct + "%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {vistas.map(v => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${vista === v.id ? "bg-[color:var(--ink)] text-[color:var(--bg-card)] border-[color:var(--ink)]" : "bg-[color:var(--bg-card)] text-[color:var(--ink)] border-[color:var(--border)] hover:border-[color:var(--ink-soft)]"}`}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-card)]">
        <table className="w-full text-sm">
          <thead className="text-left uppercase tracking-widest text-xs text-[color:var(--ink-soft)]">
            <tr className="border-b border-[color:var(--border)]">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Clienta</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(f => (
              <tr key={f.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--chip-bg)]">
                <td className="px-4 py-3 whitespace-nowrap">{fmtDateShort(f.fecha)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{f.tipo === "💰 Ingreso" ? "💰" : "💸"}</span>
                    <span className="text-[color:var(--ink)]">{f.descripcion}</span>
                    {f.esRecurrente && <Badge tone="sage">🔁</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-[color:var(--ink-soft)]">{f.categoria}</td>
                <td className="px-4 py-3 text-[color:var(--ink-soft)]">{clientes.find(c => c.id === f.clienteId)?.nombre || "—"}</td>
                <td className={`px-4 py-3 text-right font-medium ${f.tipo === "💰 Ingreso" ? "text-[color:var(--sage-deep)]" : "text-[color:var(--rose-deep)]"}`}>
                  {f.tipo === "💰 Ingreso" ? "+" : "−"}{fmtMoney(f.monto)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditando(f)} className="p-1.5 rounded-md hover:bg-[color:var(--chip-bg)]"><Pencil size={14} /></button>
                  <button onClick={() => eliminar(f.id)} className="p-1.5 rounded-md hover:bg-[#F0D5CF] text-[#8A3524] ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[color:var(--ink-soft)] italic">Sin movimientos en esta vista.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)} title={finanzas.find(f => f.id === editando?.id) ? "Editar movimiento" : "Nuevo movimiento"}>
        {editando && (
          <form onSubmit={e => { e.preventDefault(); save(editando); }}>
            <Field label="Tipo">
              <select className={inputCls} value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })}>
                <option>💰 Ingreso</option><option>💸 Gasto</option>
              </select>
            </Field>
            <Field label="Descripción"><input required className={inputCls} value={editando.descripcion} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha"><input type="date" required className={inputCls} value={editando.fecha} onChange={e => setEditando({ ...editando, fecha: e.target.value })} /></Field>
              <Field label="Monto"><input type="number" step="0.01" required className={inputCls} value={editando.monto} onChange={e => setEditando({ ...editando, monto: Number(e.target.value) })} /></Field>
              <Field label="Categoría">
                <input className={inputCls} list="categorias" value={editando.categoria} onChange={e => setEditando({ ...editando, categoria: e.target.value })} />
                <datalist id="categorias">
                  {["Servicios", "Productos", "Propinas", "Cera", "Insumos desechables", "Arriendo", "Servicios (luz, agua, internet)", "Marketing", "Equipamiento", "Sueldos", "Impuestos", "Capacitación", "Otros"].map(c => <option key={c}>{c}</option>)}
                </datalist>
              </Field>
              <Field label="Método">
                <select className={inputCls} value={editando.metodo} onChange={e => setEditando({ ...editando, metodo: e.target.value })}>
                  {["Efectivo", "Transferencia", "Tarjeta", "Yape/Plin"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            {editando.tipo === "💰 Ingreso" && (
              <Field label="Clienta (opcional)">
                <select className={inputCls} value={editando.clienteId || ""} onChange={e => setEditando({ ...editando, clienteId: e.target.value || null })}>
                  <option value="">—</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </Field>
            )}
            <label className="flex items-center gap-2 mb-4 text-sm text-[color:var(--ink)]">
              <input type="checkbox" checked={editando.esRecurrente} onChange={e => setEditando({ ...editando, esRecurrente: e.target.checked })} />
              Es un gasto recurrente (fijo)
            </label>
            <div className="flex justify-end gap-2 mt-2"><Btn variant="ghost" onClick={() => setEditando(null)}>Cancelar</Btn><Btn type="submit">Guardar</Btn></div>
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   APP PRINCIPAL
   ============================================================ */
export default function App() {
  const [state, setState] = useState({ clientes: [], citas: [], servicios: [], historial: [], finanzas: [] });
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState("home");

  // Cargar datos al iniciar desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      } else {
        setState(seedData());
      }
    } catch (e) {
      console.error("Error cargando datos:", e);
      setState(seedData());
    }
    setLoaded(true);
  }, []);

  // Guardar en cada cambio
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error guardando:", e);
    }
  }, [state, loaded]);

  const reset = async () => {
    if (!confirm("¿Restaurar los datos de ejemplo? Esto borrará lo que hayas ingresado.")) return;
    const fresh = seedData();
    setState(fresh);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)]">
        <div className="text-center">
          <img src={logoWax} alt="Wax" className="w-36 mx-auto animate-pulse" />
          <p className="text-sm text-[color:var(--ink-soft)] mt-5 tracking-wide">cargando tu negocio…</p>
        </div>
      </div>
    );
  }

  const nav = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "clientes", label: "Clientas", icon: Users },
    { id: "citas", label: "Agenda", icon: Calendar },
    { id: "servicios", label: "Servicios", icon: Sparkles },
    { id: "historial", label: "Historial", icon: ClipboardList },
    { id: "finanzas", label: "Finanzas", icon: Wallet },
  ];

  return (
    <>
      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
        {/* Header */}
        <header className="border-b border-[color:var(--border)] bg-[color:var(--bg-card)] sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img src={logoWax} alt="Wax" className="h-10 w-auto" />
                <div className="w-px h-6 bg-[color:var(--border)]" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--ink-soft)]">studio · crm</p>
              </div>
              <button onClick={reset} className="text-xs text-[color:var(--ink-soft)] hover:text-[color:var(--rose-deep)] tracking-wide">reiniciar demo</button>
            </div>
            <nav className="flex gap-1 overflow-x-auto -mx-1 pb-0.5">
              {nav.map(n => {
                const Icon = n.icon;
                const active = section === n.id;
                return (
                  <button key={n.id} onClick={() => setSection(n.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 mx-1 text-sm font-medium whitespace-nowrap border-b-2 transition ${active ? "text-[color:var(--rose-deep)] border-[color:var(--rose-deep)]" : "text-[color:var(--ink-soft)] border-transparent hover:text-[color:var(--ink)]"}`}>
                    <Icon size={15} />
                    {n.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Contenido */}
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
          {section === "home" && <Dashboard state={state} goTo={setSection} />}
          {section === "clientes" && <ClientesView state={state} setState={setState} />}
          {section === "citas" && <CitasView state={state} setState={setState} />}
          {section === "servicios" && <ServiciosView state={state} setState={setState} />}
          {section === "historial" && <HistorialView state={state} setState={setState} />}
          {section === "finanzas" && <FinanzasView state={state} setState={setState} />}
        </main>

        <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
          <p className="text-xs text-[color:var(--ink-soft)] tracking-[0.2em] uppercase">hecho para ti · con cuidado en cada detalle</p>
        </footer>
      </div>
    </>
  );
}
