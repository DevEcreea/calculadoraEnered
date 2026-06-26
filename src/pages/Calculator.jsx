import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Fuel,
  MessageCircle,
  Info,
  Rocket,
  Loader2,
  Timer,
  AlertTriangle,
} from "lucide-react";
import {
  ELIGIBILITY_QUESTIONS,
  VEHICLE_CATEGORIES,
  evaluateEligibility,
  calculateSubsidy,
  formatSoles,
  formatSolesInt,
  formatGalones,
  SUBSIDIO_GL,
  MESES,
} from "../lib/calculatorData";

// ---------- Header ----------
const Header = ({ timeLeft }) => {
  const { days, hours, minutes, seconds } = timeLeft;
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand to-brand-500 px-6 sm:px-10 py-8 sm:py-10">
      <div className="absolute -top-24 -right-6 h-72 w-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative mx-auto max-w-3xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <img
            src="/assets/enered-logo.png"
            alt="Enered"
            className="h-8 sm:h-9 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
            data-testid="brand-logo"
          />
          
          {/* TIMER */}
          <div className="flex items-center gap-3.5 bg-black/25 border border-white/15 rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3.5 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <Timer className="w-5 h-5 sm:w-6 h-6 text-white/90 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 font-cabinet">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight leading-none min-w-[24px] text-center">{days}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-white/60 tracking-wider mt-1.5">DÍAS</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold leading-none -mt-4 sm:-mt-5 text-white/40">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight leading-none min-w-[24px] text-center">{hours}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-white/60 tracking-wider mt-1.5">HRS</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold leading-none -mt-4 sm:-mt-5 text-white/40">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight leading-none min-w-[24px] text-center">{minutes}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-white/60 tracking-wider mt-1.5">MIN</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold leading-none -mt-4 sm:-mt-5 text-white/40">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight leading-none min-w-[24px] text-center">{seconds}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-white/60 tracking-wider mt-1.5">SEG</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
          <img
            src="/assets/robot.png"
            alt="Robot"
            className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-white font-extrabold font-cabinet text-xl sm:text-2xl md:text-3xl leading-tight mb-1" data-testid="hero-title">
              Calcula el ahorro total de tu flota al instante
            </h1>
            <p className="text-white/95 text-[13.5px] sm:text-base font-semibold mb-1 leading-snug">
              Subsidio Estatal de Combustible | D.U. N.° 004-2026.
            </p>
            <p className="text-white/80 text-xs sm:text-[13.5px] leading-relaxed">
              Descubre la calificación de tu flota y cuánto te corresponde en la devolución
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

// ---------- Progress ----------
const Progress = ({ stage }) => {
  // map stage -> step index. stage 0 = step0, stage1 = step1, stage2 = step2
  const steps = [0, 1, 2];
  const currentIdx = stage === "stage0" || stage === "stageNo" ? 0 : stage === "stage1" ? 1 : 2;
  return (
    <div className="flex gap-2 px-6 sm:px-10 pt-6" data-testid="progress-bar">
      {steps.map((s) => {
        const done = s < currentIdx;
        const active = s === currentIdx;
        return (
          <div key={s} className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                done ? "bg-emerald-500 w-full" : active ? "bg-gradient-to-r from-brand to-brand-500 w-full" : "w-0"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

// ---------- Option pill ----------
const Option = ({ selected, onClick, icon, text, testId }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className={`w-full text-left flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-sm transition-all ${
      selected
        ? "border-brand bg-brand-50 shadow-[0_2px_12px_rgba(128,57,244,0.15)]"
        : "border-neutral-200 bg-white hover:border-brand-200 hover:bg-brand-50/50"
    }`}
  >
    <span className="text-lg leading-none flex-shrink-0" aria-hidden>{icon}</span>
    <span className="flex-1 text-neutral-800 font-medium">{text}</span>
    <span
      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? "border-brand" : "border-neutral-300"
      }`}
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
    </span>
  </button>
);

// ---------- Question block ----------
const QuestionBlock = ({ index, q, value, onChange, ambitoOtro, setAmbitoOtro }) => (
  <div className="mb-6" data-testid={`question-${q.key}`}>
    <div className="flex items-baseline gap-2.5 mb-2">
      <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] rounded-lg bg-brand-50 text-brand text-xs font-extrabold px-1.5">
        {index + 1}
      </span>
      <span className="text-[15px] font-bold text-neutral-900">{q.title}</span>
    </div>
    <div className="ml-9 mb-3 text-[12.5px] text-neutral-500">{q.hint}</div>
    <div className="flex flex-col gap-2">
      {q.options.map((opt) => (
        <Option
          key={opt.value}
          icon={opt.icon}
          text={opt.text}
          selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          testId={`option-${q.key}-${opt.value}`}
        />
      ))}
    </div>
    {q.key === "ambito" && value === "otros" && (
      <div className="mt-3 ml-1">
        <input
          type="text"
          data-testid="ambito-otro-input"
          value={ambitoOtro}
          onChange={(e) => setAmbitoOtro(e.target.value)}
          placeholder="Especifica qué tipo de servicio prestas..."
          className="w-full rounded-xl border-[1.5px] border-brand-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand"
        />
      </div>
    )}
  </div>
);

// ---------- Stage 0: Elegibilidad ----------
const Stage0 = ({ answers, setAnswers, ambitoOtro, setAmbitoOtro, onCheck }) => {
  const allAnswered = ELIGIBILITY_QUESTIONS.every((q) => answers[q.key]);
  return (
    <section className="px-6 sm:px-10 py-7 animate-slide-in" data-testid="stage-eligibility">
      <div className="text-xs font-bold tracking-wider uppercase text-brand mb-1.5">Paso 1 de 3 · Elegibilidad</div>
      <h2 className="text-[22px] sm:text-2xl font-extrabold font-cabinet text-neutral-900 mb-1.5">¿Calificas para el subsidio?</h2>
      <p className="text-sm text-neutral-500 mb-6">
        Responde rápido. Si calificas, pasamos directo a calcular tu devolución estimada.
      </p>

      {ELIGIBILITY_QUESTIONS.map((q, i) => (
        <QuestionBlock
          key={q.key}
          index={i}
          q={q}
          value={answers[q.key]}
          onChange={(v) => setAnswers({ ...answers, [q.key]: v })}
          ambitoOtro={ambitoOtro}
          setAmbitoOtro={setAmbitoOtro}
        />
      ))}

      <div className="flex justify-end mt-2">
        <button
          type="button"
          disabled={!allAnswered}
          onClick={onCheck}
          data-testid="check-eligibility-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(128,57,244,0.25)] hover:shadow-[0_6px_22px_rgba(128,57,244,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Verificar elegibilidad <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
};

// ---------- Stage NO ----------
const StageNo = ({ verdict, onBack }) => (
  <section className="px-6 sm:px-10 py-7 animate-slide-in" data-testid="stage-no">
    <div className="flex items-start gap-3 rounded-2xl bg-red-50 border-[1.5px] border-red-200 p-5 mb-6 animate-pop-in">
      <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={28} strokeWidth={2.25} />
      <div>
        <h3 className="text-base font-bold text-red-700 mb-1" data-testid="no-title">
          Con estas respuestas no calificarías para el DU 004-2026
        </h3>
        <p className="text-sm text-neutral-700">{verdict?.reason}</p>
      </div>
    </div>

    {verdict?.alt && (
      <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4 text-sm text-neutral-800 mb-5">
        <Info className="inline-block mr-1.5 -mt-0.5" size={15} /> {verdict.alt}
      </div>
    )}

    <div className="flex justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        data-testid="back-from-no-btn"
        className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all"
      >
        <ArrowLeft size={16} /> Revisar respuestas
      </button>
      <a
        href="https://wa.me/51999999999?text=Hola%20Enered%2C%20quiero%20revisar%20mi%20caso%20del%20DU%20004-2026"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="contact-advisor-btn"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-500 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(128,57,244,0.25)] hover:shadow-[0_6px_22px_rgba(128,57,244,0.35)] transition-all"
      >
        <MessageCircle size={16} /> Hablar con un asesor
      </a>
    </div>
  </section>
);

// ---------- Stage 1: Fleet input ----------
const Stage1 = ({ precioDiesel, setPrecioDiesel, vehicles, setVehicles, onBack, onCalc }) => {
  const addRow = () =>
    setVehicles([...vehicles, { categoryId: "M2", consumo: "", unidades: "" }]);
  const removeRow = (idx) => setVehicles(vehicles.filter((_, i) => i !== idx));
  const updateRow = (idx, patch) =>
    setVehicles(vehicles.map((v, i) => (i === idx ? { ...v, ...patch } : v)));

  const canCalc =
    vehicles.length > 0 &&
    vehicles.every(
      (v) =>
        v.categoryId &&
        Number(v.consumo) > 0 &&
        Number(v.unidades) > 0
    ) &&
    Number(precioDiesel) > 0;

  return (
    <section className="px-6 sm:px-10 py-7 animate-slide-in" data-testid="stage-fleet">
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border-[1.5px] border-emerald-200 p-5 mb-6 animate-pop-in">
        <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={28} strokeWidth={2.25} />
        <div>
          <h3 className="text-base font-bold text-emerald-700 mb-1" data-testid="ok-title">
            ¡Calificas para el subsidio!
          </h3>
          <p className="text-sm text-neutral-700">
            Ahora estimemos tu devolución. Agrega tus unidades, su consumo mensual de diésel y el precio que pagas por galón.
          </p>
        </div>
      </div>

      <div className="text-xs font-bold tracking-wider uppercase text-brand mb-1.5">Paso 2 de 3 · Tu flota y consumo</div>
      <h2 className="text-[22px] sm:text-2xl font-extrabold font-cabinet text-neutral-900 mb-1.5">Estima tu devolución</h2>
      <p className="text-sm text-neutral-500 mb-6">
        El subsidio es {formatSoles(SUBSIDIO_GL)} por galón, con un tope máximo por categoría. La calculadora aplica ese tope automáticamente.
      </p>

      <div className="mb-6">
        <label className="block text-[14.5px] font-semibold text-neutral-800 mb-2">
          <Fuel className="inline-block mr-1.5 -mt-0.5 text-brand" size={16} />
          Precio promedio del diésel por galón (S/)
        </label>
        <input
          type="number"
          step="0.10"
          min="0"
          value={precioDiesel}
          onChange={(e) => setPrecioDiesel(e.target.value)}
          data-testid="diesel-price-input"
          className="w-full rounded-xl border-[1.5px] border-neutral-200 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand"
        />
        <p className="text-xs text-neutral-500 mt-1.5">
          Solo de referencia, para mostrarte cuánto representa el subsidio frente a tu gasto. El subsidio es fijo: {formatSoles(SUBSIDIO_GL)} por galón.
        </p>
      </div>

      <div className="mb-3">
        {/* Header de columnas: solo visible en sm+ */}
        <div className="hidden sm:grid grid-cols-[1.4fr_1fr_1fr_42px] gap-2.5 pb-2 px-1 text-[11px] uppercase tracking-wider font-bold text-neutral-500">
          <div>Categoría</div>
          <div>Consumo/mes (gl)</div>
          <div>N° unidades</div>
          <div />
        </div>
        <div className="flex flex-col gap-3 sm:gap-2.5">
          {vehicles.map((v, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-[1.5px] border-neutral-200 bg-white p-3 sm:p-0 sm:border-0 sm:bg-transparent sm:rounded-none sm:grid sm:grid-cols-[1.4fr_1fr_1fr_42px] sm:gap-2.5 sm:items-center animate-slide-in"
              data-testid={`vehicle-row-${idx}`}
            >
              {/* Móvil: header con número de fila + botón eliminar */}
              <div className="flex items-center justify-between mb-2 sm:hidden">
                <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-500">
                  Vehículo #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={vehicles.length === 1}
                  aria-label="Eliminar fila"
                  data-testid={`vehicle-remove-mobile-${idx}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed px-2.5 py-1.5 text-xs font-semibold transition-all"
                >
                  <Trash2 size={14} /> Quitar
                </button>
              </div>

              {/* Categoría */}
              <div className="sm:contents">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-500 mb-1 sm:hidden">
                  Categoría
                </label>
                <select
                  value={v.categoryId}
                  onChange={(e) => updateRow(idx, { categoryId: e.target.value })}
                  data-testid={`vehicle-cat-${idx}`}
                  className="w-full rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand"
                >
                  {VEHICLE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consumo */}
              <div className="mt-2.5 sm:mt-0 sm:contents">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-500 mb-1 sm:hidden">
                  Consumo/mes (gl)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={v.consumo}
                  onChange={(e) => updateRow(idx, { consumo: e.target.value })}
                  placeholder="ej. 350"
                  data-testid={`vehicle-consumo-${idx}`}
                  className="w-full rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand"
                />
              </div>

              {/* Unidades */}
              <div className="mt-2.5 sm:mt-0 sm:contents">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-500 mb-1 sm:hidden">
                  N° unidades
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={v.unidades}
                  onChange={(e) => updateRow(idx, { unidades: e.target.value })}
                  placeholder="ej. 4"
                  data-testid={`vehicle-unidades-${idx}`}
                  className="w-full rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand"
                />
              </div>

              {/* Botón eliminar - solo desktop */}
              <button
                type="button"
                onClick={() => removeRow(idx)}
                disabled={vehicles.length === 1}
                aria-label="Eliminar fila"
                data-testid={`vehicle-remove-${idx}`}
                className="hidden sm:flex h-11 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed items-center justify-center transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addRow}
        data-testid="add-vehicle-btn"
        className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-neutral-300 px-4 py-3.5 text-sm font-semibold text-brand hover:bg-brand-50 hover:border-brand transition-all"
      >
        <Plus size={16} /> Agregar otra categoría de vehículo
      </button>

      <div className="mt-6 border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4 text-sm text-neutral-800">
        <strong className="text-amber-700">Período de cálculo:</strong> {MESES} meses (junio y julio 2026). Multiplicamos tu consumo mensual × {MESES} y aplicamos el tope por unidad.
      </div>

      <div className="flex justify-between gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-elig-btn"
          className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <button
          type="button"
          onClick={onCalc}
          disabled={!canCalc}
          data-testid="see-result-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(128,57,244,0.25)] hover:shadow-[0_6px_22px_rgba(128,57,244,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Ver mi devolución <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
};

// ---------- Stage 2: Result ----------
const Stage2 = ({ result, precioDiesel, vehicles, onBack, onEmpezarRegistro, submitting }) => {
  if (!result) return null;
  const { totalSubsidy, totalGallonsRecognized, totalExpense, coverage, details } = result;

  return (
    <section className="px-6 sm:px-10 py-7 animate-slide-in" data-testid="stage-result">
      <div className="text-xs font-bold tracking-wider uppercase text-brand mb-1.5">Paso 3 de 3 · Tu estimado</div>
      <h2 className="text-[22px] sm:text-2xl font-extrabold font-cabinet text-neutral-900 mb-1.5">Tu devolución estimada</h2>
      <p className="text-sm text-neutral-500 mb-6">
        Estimado referencial por los dos meses del decreto, con topes aplicados.
      </p>

      <div className="bg-white rounded-2xl border-[1.5px] border-neutral-200 px-6 py-7 text-center mb-5 shadow-[0_8px_30px_rgba(128,57,244,0.08)]">
        <div className="text-[12.5px] font-bold tracking-wider uppercase text-brand mb-3.5">
          Devolución total estimada (2 meses)
        </div>
        <div className="flex items-end justify-center">
          <div className="flex flex-col items-center px-4">
            <span className="text-4xl sm:text-5xl font-extrabold font-cabinet text-brand leading-none tracking-tight" data-testid="total-subsidy">
              {formatSolesInt(totalSubsidy)}
            </span>
            <span className="text-[11px] text-neutral-500 mt-2 font-semibold uppercase tracking-wider">Subsidio</span>
          </div>
          <div className="w-px h-12 bg-neutral-200 mx-1 mb-3" />
          <div className="flex flex-col items-center px-4 opacity-60">
            <span className="text-2xl sm:text-3xl font-bold font-cabinet text-neutral-400 leading-none tracking-tight">
              {formatSolesInt(totalExpense)}
            </span>
            <span className="text-[11px] text-neutral-400 mt-2 font-semibold uppercase tracking-wider">Tu gasto est.</span>
          </div>
        </div>
        <div className="text-[13px] text-neutral-500 mt-4" data-testid="total-gallons">
          {formatGalones(totalGallonsRecognized)} galones reconocidos · {MESES} meses
        </div>
        {totalExpense > 0 && (
          <div className="mt-3 inline-block bg-brand-50 text-brand-700 text-[12.5px] rounded-xl px-3.5 py-2.5 leading-relaxed">
            El subsidio cubre aproximadamente <strong className="text-brand">{coverage.toFixed(1)}%</strong> de tu gasto estimado de diésel.
          </div>
        )}
      </div>

      <div className="bg-white border-[1.5px] border-neutral-200 rounded-2xl overflow-hidden mb-5" data-testid="breakdown">
        <div className="flex justify-between px-5 py-3.5 text-sm border-b border-neutral-100">
          <span className="text-neutral-500">Subsidio por galón</span>
          <span className="font-semibold text-neutral-800">{formatSoles(SUBSIDIO_GL)}</span>
        </div>
        <div className="flex justify-between px-5 py-3.5 text-sm border-b border-neutral-100">
          <span className="text-neutral-500">Galones reconocidos (2 meses)</span>
          <span className="font-semibold text-neutral-800">{formatGalones(totalGallonsRecognized)} gl</span>
        </div>
        <div className="flex justify-between px-5 py-3.5 text-sm border-b border-neutral-100">
          <span className="text-neutral-500">Precio diésel referencia</span>
          <span className="font-semibold text-neutral-800">{formatSoles(precioDiesel)} / gl</span>
        </div>
        <div className="flex justify-between px-5 py-4 text-sm bg-brand-50">
          <span className="text-brand-700 font-bold">Devolución estimada</span>
          <span className="text-brand font-extrabold text-base">{formatSoles(totalSubsidy)}</span>
        </div>
      </div>

      <div className="bg-white border-[1.5px] border-neutral-200 rounded-2xl px-5 py-4 mb-5">
        <h4 className="text-[12.5px] font-extrabold uppercase tracking-wider text-brand mb-3">Detalle por categoría</h4>
        <div className="flex flex-col">
          {details.map((d, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2.5 text-[13.5px] border-b border-neutral-100 last:border-b-0"
              data-testid={`detail-row-${i}`}
            >
              <div className="text-neutral-700">
                <span className="font-semibold">{d.categoryId}</span> · {d.categoryLabel}
                <span className="text-neutral-500"> · {d.unidades} unid. × {d.consumo} gl/mes</span>
                {d.capped && (
                  <span className="ml-2 text-amber-600 text-[11.5px] font-semibold">⚠ tope aplicado</span>
                )}
              </div>
              <div className="font-semibold text-neutral-900 sm:text-right">
                {formatSoles(d.subsidyGrupo)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4 text-sm text-neutral-800 mb-6">
        <Info className="inline-block mr-1.5 -mt-0.5" size={15} />{" "}
        <strong className="text-amber-700">Esto es un estimado.</strong> El monto final depende de tus comprobantes electrónicos reales, que el proveedor tenga Registro Osinergmin vigente, y que tus títulos habilitantes estén en los sistemas de la ATU. Enered valida todo antes de presentar.
      </div>

      <div className="bg-gradient-to-br from-brand-50 to-brand-100 border-[1.5px] border-brand-100 rounded-2xl p-6 text-center">
        <Sparkles className="mx-auto text-brand mb-2" size={26} />
        <h3 className="text-[17px] font-extrabold font-cabinet text-brand-700 mb-2">¿Listo para recuperar este monto?</h3>
        <p className="text-[13.5px] text-neutral-600 mb-4">
          Sube tus documentos a nuestra plataforma y nosotros gestionamos toda la solicitud ante la ATU por ti.
        </p>
        <button
          type="button"
          onClick={onEmpezarRegistro}
          disabled={submitting}
          data-testid="start-registration-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(128,57,244,0.25)] hover:shadow-[0_6px_22px_rgba(128,57,244,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Rocket size={16} /> Empezar mi registro
            </>
          )}
        </button>
      </div>

      <div className="flex justify-between gap-3 mt-5">
        <button
          type="button"
          onClick={onBack}
          data-testid="adjust-data-btn"
          className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all"
        >
          <ArrowLeft size={16} /> Ajustar datos
        </button>
      </div>

      <p className="text-[11.5px] text-neutral-500 text-center mt-5 leading-relaxed">
        Enered · Cálculo basado en el DU 004-2026. El subsidio se otorga por adquisiciones de combustible del 29 mayo al 28 julio 2026. Solicitud única ante la ATU vía mesa de partes virtual.
      </p>
    </section>
  );
};

// ---------- Main calculator ----------
export default function Calculator() {
  const [stage, setStage] = useState("stage0");
  const [answers, setAnswers] = useState({});
  const [ambitoOtro, setAmbitoOtro] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [precioDiesel, setPrecioDiesel] = useState("16.50");
  const [vehicles, setVehicles] = useState([{ categoryId: "M2", consumo: "", unidades: "" }]);

  // countdown state
  const [timeLeft, setTimeLeft] = useState(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date("2026-07-28T23:59:59");
      const difference = targetDate - new Date();
      if (difference <= 0) {
        return { days: "00", hours: "00", minutes: "00", seconds: "00", totalDays: 0 };
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const totalDays = Math.ceil(difference / (1000 * 60 * 60 * 24));
      
      const pad = (num) => String(num).padStart(2, "0");
      return {
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
        totalDays
      };
    };
    return calculateTimeLeft();
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date("2026-07-28T23:59:59");
      const difference = targetDate - new Date();
      if (difference <= 0) {
        return { days: "00", hours: "00", minutes: "00", seconds: "00", totalDays: 0 };
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const totalDays = Math.ceil(difference / (1000 * 60 * 60 * 24));
      
      const pad = (num) => String(num).padStart(2, "0");
      return {
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
        totalDays
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const result = useMemo(() => {
    if (stage !== "stage2") return null;
    return calculateSubsidy(vehicles, Number(precioDiesel) || 0);
  }, [stage, vehicles, precioDiesel]);

  const handleCheck = () => {
    const v = evaluateEligibility(answers, ambitoOtro);
    setVerdict(v);
    setStage(v.ok ? "stage1" : "stageNo");
  };

  const handleEmpezarRegistro = async () => {
    if (!result || submitting) return;
    setSubmitting(true);
    const califica = true;
    const apiUrl = process.env.REACT_APP_API_URL;
    const plataforma = process.env.REACT_APP_PLATAFORMA_URL;

    const payload = {
      califica,
      categorias: vehicles.map((v) => ({
        code: v.categoryId,
        cantidad: Number(v.unidades),
        galones_mensuales: Number(v.consumo),
      })),
      total_galones_mensuales: vehicles.reduce(
        (a, v) => a + Number(v.unidades) * Number(v.consumo),
        0
      ),
      subsidio_estimado: result.totalSubsidy,
      detalle: result,
      canal_origen: "calculadora",
    };

    try {
      const { data } = await axios.post(`${apiUrl}/api/calculations`, payload);
      window.location.href = `${plataforma}/registro-subsidio?calc_id=${data.calc_id}`;
    } catch (e) {
      alert("No pudimos guardar tu cálculo. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6FB] py-6 sm:py-10">
      <div className="mx-auto max-w-[760px] bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(128,57,244,0.18)] overflow-hidden border border-neutral-100">
        <Header timeLeft={timeLeft} />
        
        {/* Banner de Advertencia */}
        <div className="bg-red-50/80 border-b border-red-100 py-3 px-4 text-center text-xs sm:text-sm text-red-800 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>
            El subsidio <strong className="font-bold">no se renueva</strong>. Cierra el <strong className="font-bold">28 de julio</strong> · quedan <strong className="font-bold text-red-600">{Number(timeLeft.days)}</strong> días para presentar tu expediente.
          </span>
        </div>

        <Progress stage={stage} />

        {stage === "stage0" && (
          <Stage0
            answers={answers}
            setAnswers={setAnswers}
            ambitoOtro={ambitoOtro}
            setAmbitoOtro={setAmbitoOtro}
            onCheck={handleCheck}
          />
        )}
        {stage === "stageNo" && (
          <StageNo verdict={verdict} onBack={() => setStage("stage0")} />
        )}
        {stage === "stage1" && (
          <Stage1
            precioDiesel={precioDiesel}
            setPrecioDiesel={setPrecioDiesel}
            vehicles={vehicles}
            setVehicles={setVehicles}
            onBack={() => setStage("stage0")}
            onCalc={() => setStage("stage2")}
          />
        )}
        {stage === "stage2" && (
          <Stage2
            result={result}
            precioDiesel={Number(precioDiesel) || 0}
            vehicles={vehicles}
            onBack={() => setStage("stage1")}
            onEmpezarRegistro={handleEmpezarRegistro}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
