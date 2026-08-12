import { useState, useEffect } from "react";
import { Trash2, Plus, Check, Home, UtensilsCrossed, ShoppingCart, CalendarDays, Languages, StickyNote } from "lucide-react";

const T = {
  ar: {
    appName: "بيتي",
    tagline: "تنظيم البيت بكل بساطة",
    tabs: { clean: "التنظيف", meals: "الأكل", shop: "المشتريات", dates: "المواعيد", notes: "ملاحظات" },
    days: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
    cleanPlaceholder: "أضيفي مهمة تنظيف...",
    mealPlaceholder: "أضيفي أكلة...",
    shopPlaceholder: "أضيفي غرض...",
    shopQty: "الكمية",
    dateTitlePlaceholder: "عنوان الموعد...",
    dateDatePlaceholder: "التاريخ",
    add: "إضافة",
    empty: { clean: "ما كاينش مهام اليوم", meals: "ما كاينش أكلة مقررة", shop: "قائمة المشتريات فارغة", dates: "ما كاينش مواعيد", notes: "ما كاينش ملاحظات" },
    noteHint: "ملاحظة (اختياري)",
    notesPlaceholder: "كتبي ملاحظة...",
  },
  es: {
    appName: "Mi Casa",
    tagline: "Organiza tu hogar fácilmente",
    tabs: { clean: "Limpieza", meals: "Comidas", shop: "Compras", dates: "Citas", notes: "Notas" },
    days: ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
    cleanPlaceholder: "Añadir tarea de limpieza...",
    mealPlaceholder: "Añadir plato...",
    shopPlaceholder: "Añadir artículo...",
    shopQty: "Cantidad",
    dateTitlePlaceholder: "Título de la cita...",
    dateDatePlaceholder: "Fecha",
    add: "Añadir",
    empty: { clean: "No hay tareas hoy", meals: "No hay comida planeada", shop: "La lista está vacía", dates: "No hay citas", notes: "No hay notas" },
    noteHint: "Nota (opcional)",
    notesPlaceholder: "Escribir una nota...",
  },
  fr: {
    appName: "Ma Maison",
    tagline: "Organisez votre foyer facilement",
    tabs: { clean: "Ménage", meals: "Repas", shop: "Courses", dates: "Rendez-vous", notes: "Notes" },
    days: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],
    cleanPlaceholder: "Ajouter une tâche de ménage...",
    mealPlaceholder: "Ajouter un plat...",
    shopPlaceholder: "Ajouter un article...",
    shopQty: "Quantité",
    dateTitlePlaceholder: "Titre du rendez-vous...",
    dateDatePlaceholder: "Date",
    add: "Ajouter",
    empty: { clean: "Aucune tâche aujourd'hui", meals: "Aucun repas prévu", shop: "La liste est vide", dates: "Aucun rendez-vous", notes: "Aucune note" },
    noteHint: "Note (facultatif)",
    notesPlaceholder: "Écrire une note...",
  },
};

const STORAGE_KEY = "beit-organizer-data-v1";

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function BeitOrganizer() {
  const [lang, setLang] = useState("ar");
  const [tab, setTab] = useState("clean");
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState({
    clean: {}, // day -> [{id,text,done}]
    meals: {}, // day -> [{id,text}]
    shop: [], // [{id,text,qty,done}]
    dates: [], // [{id,title,date,note}]
    notes: [], // [{id,text}]
  });

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (e) {
      // no data yet
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("save failed", e);
    }
  }, [data, loaded]);

  const todayIdx = new Date().getDay();

  function addCleanTask(day, text) {
    if (!text.trim()) return;
    setData((d) => ({
      ...d,
      clean: { ...d.clean, [day]: [...(d.clean[day] || []), { id: uid(), text, done: false }] },
    }));
  }
  function toggleClean(day, id) {
    setData((d) => ({
      ...d,
      clean: { ...d.clean, [day]: d.clean[day].map((x) => (x.id === id ? { ...x, done: !x.done } : x)) },
    }));
  }
  function delClean(day, id) {
    setData((d) => ({ ...d, clean: { ...d.clean, [day]: d.clean[day].filter((x) => x.id !== id) } }));
  }

  function addMeal(day, text) {
    if (!text.trim()) return;
    setData((d) => ({ ...d, meals: { ...d.meals, [day]: [...(d.meals[day] || []), { id: uid(), text }] } }));
  }
  function delMeal(day, id) {
    setData((d) => ({ ...d, meals: { ...d.meals, [day]: (d.meals[day] || []).filter((x) => x.id !== id) } }));
  }

  function addShop(text, qty) {
    if (!text.trim()) return;
    setData((d) => ({ ...d, shop: [...d.shop, { id: uid(), text, qty: qty || "", done: false }] }));
  }
  function toggleShop(id) {
    setData((d) => ({ ...d, shop: d.shop.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));
  }
  function delShop(id) {
    setData((d) => ({ ...d, shop: d.shop.filter((x) => x.id !== id) }));
  }

  function addDateItem(title, date, note) {
    if (!title.trim()) return;
    setData((d) => ({
      ...d,
      dates: [...d.dates, { id: uid(), title, date, note }].sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    }));
  }
  function delDate(id) {
    setData((d) => ({ ...d, dates: d.dates.filter((x) => x.id !== id) }));
  }

  function addNote(text) {
    if (!text.trim()) return;
    setData((d) => ({ ...d, notes: [{ id: uid(), text }, ...d.notes] }));
  }
  function delNote(id) {
    setData((d) => ({ ...d, notes: d.notes.filter((x) => x.id !== id) }));
  }

  const tabList = [
    { key: "clean", label: t.tabs.clean, icon: Home },
    { key: "meals", label: t.tabs.meals, icon: UtensilsCrossed },
    { key: "shop", label: t.tabs.shop, icon: ShoppingCart },
    { key: "dates", label: t.tabs.dates, icon: CalendarDays },
    { key: "notes", label: t.tabs.notes, icon: StickyNote },
  ];

  return (
    <div dir={dir} className="min-h-screen w-full" style={{ background: "#F7F3EC", fontFamily: lang === "ar" ? "'Segoe UI', Tahoma, sans-serif" : "'Segoe UI', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#3D5A50", letterSpacing: "-0.02em" }}>
              {t.appName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#8A8073" }}>{t.tagline}</p>
          </div>
          <button
            onClick={() => setLang((l) => (l === "ar" ? "es" : l === "es" ? "fr" : "ar"))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ background: "#3D5A50", color: "#F7F3EC" }}
          >
            <Languages size={16} />
            {lang === "ar" ? "ES" : lang === "es" ? "FR" : "ع"}
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-5 gap-1.5 mb-6">
          {tabList.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-semibold transition-all"
              style={{
                background: tab === key ? "#C97B4A" : "#FFFFFF",
                color: tab === key ? "#FFFFFF" : "#4A4238",
                boxShadow: tab === key ? "0 4px 12px rgba(201,123,74,0.35)" : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {tab === "clean" && (
          <CleanTab t={t} data={data.clean} todayIdx={todayIdx} onAdd={addCleanTask} onToggle={toggleClean} onDel={delClean} />
        )}
        {tab === "meals" && (
          <MealsTab t={t} data={data.meals} onAdd={addMeal} onDel={delMeal} />
        )}
        {tab === "shop" && (
          <ShopTab t={t} items={data.shop} onAdd={addShop} onToggle={toggleShop} onDel={delShop} />
        )}
        {tab === "dates" && (
          <DatesTab t={t} items={data.dates} onAdd={addDateItem} onDel={delDate} lang={lang} />
        )}
        {tab === "notes" && (
          <NotesTab t={t} items={data.notes} onAdd={addNote} onDel={delNote} />
        )}
      </div>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      {children}
    </div>
  );
}

function AddRow({ placeholder, onAdd, extra }) {
  const [val, setVal] = useState("");
  const [extraVal, setExtraVal] = useState("");
  return (
    <div className="flex gap-2 mt-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(val, extraVal);
            setVal("");
            setExtraVal("");
          }
        }}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
        style={{ background: "#F7F3EC", color: "#3D3A34", border: "1px solid #E5DFD3" }}
      />
      {extra && (
        <input
          value={extraVal}
          onChange={(e) => setExtraVal(e.target.value)}
          placeholder={extra}
          className="w-20 px-2 py-2 rounded-xl text-sm outline-none"
          style={{ background: "#F7F3EC", color: "#3D3A34", border: "1px solid #E5DFD3" }}
        />
      )}
      <button
        onClick={() => {
          onAdd(val, extraVal);
          setVal("");
          setExtraVal("");
        }}
        className="px-3 rounded-xl flex items-center justify-center"
        style={{ background: "#3D5A50" }}
      >
        <Plus size={18} color="#FFF" />
      </button>
    </div>
  );
}

function CleanTab({ t, data, todayIdx, onAdd, onToggle, onDel }) {
  const [openDay, setOpenDay] = useState(todayIdx);
  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1">
        {t.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setOpenDay(i)}
            className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap"
            style={{
              background: openDay === i ? "#C97B4A" : i === todayIdx ? "#E8DCC8" : "#FFFFFF",
              color: openDay === i ? "#FFF" : "#4A4238",
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <SectionCard>
        {(data[openDay] || []).length === 0 && (
          <p className="text-sm text-center py-3" style={{ color: "#B0A896" }}>{t.empty.clean}</p>
        )}
        <div className="flex flex-col gap-2">
          {(data[openDay] || []).map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <button
                onClick={() => onToggle(openDay, task.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: task.done ? "#3D5A50" : "#F7F3EC", border: "1.5px solid #3D5A50" }}
              >
                {task.done && <Check size={14} color="#FFF" />}
              </button>
              <span
                className="flex-1 text-sm"
                style={{ color: task.done ? "#B0A896" : "#3D3A34", textDecoration: task.done ? "line-through" : "none" }}
              >
                {task.text}
              </span>
              <button onClick={() => onDel(openDay, task.id)}>
                <Trash2 size={16} color="#C97B4A" />
              </button>
            </div>
          ))}
        </div>
        <AddRow placeholder={t.cleanPlaceholder} onAdd={(val) => onAdd(openDay, val)} />
      </SectionCard>
    </div>
  );
}

function MealsTab({ t, data, onAdd, onDel }) {
  return (
    <div className="flex flex-col gap-3">
      {t.days.map((d, i) => (
        <SectionCard key={i}>
          <h3 className="text-sm font-bold mb-2" style={{ color: "#C97B4A" }}>{d}</h3>
          {(data[i] || []).length === 0 && (
            <p className="text-xs" style={{ color: "#B0A896" }}>{t.empty.meals}</p>
          )}
          <div className="flex flex-col gap-1.5">
            {(data[i] || []).map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm" style={{ color: "#3D3A34" }}>{m.text}</span>
                <button onClick={() => onDel(i, m.id)}>
                  <Trash2 size={15} color="#C97B4A" />
                </button>
              </div>
            ))}
          </div>
          <AddRow placeholder={t.mealPlaceholder} onAdd={(val) => onAdd(i, val)} />
        </SectionCard>
      ))}
    </div>
  );
}

function ShopTab({ t, items, onAdd, onToggle, onDel }) {
  return (
    <SectionCard>
      {items.length === 0 && <p className="text-sm text-center py-3" style={{ color: "#B0A896" }}>{t.empty.shop}</p>}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <button
              onClick={() => onToggle(item.id)}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: item.done ? "#3D5A50" : "#F7F3EC", border: "1.5px solid #3D5A50" }}
            >
              {item.done && <Check size={14} color="#FFF" />}
            </button>
            <span
              className="flex-1 text-sm"
              style={{ color: item.done ? "#B0A896" : "#3D3A34", textDecoration: item.done ? "line-through" : "none" }}
            >
              {item.text}
            </span>
            {item.qty && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#E8DCC8", color: "#4A4238" }}>
                {item.qty}
              </span>
            )}
            <button onClick={() => onDel(item.id)}>
              <Trash2 size={16} color="#C97B4A" />
            </button>
          </div>
        ))}
      </div>
      <AddRow placeholder={t.shopPlaceholder} extra={t.shopQty} onAdd={(val, qty) => onAdd(val, qty)} />
    </SectionCard>
  );
}

function DatesTab({ t, items, onAdd, onDel, lang }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  return (
    <SectionCard>
      {items.length === 0 && <p className="text-sm text-center py-3" style={{ color: "#B0A896" }}>{t.empty.dates}</p>}
      <div className="flex flex-col gap-2 mb-3">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "#F7F3EC" }}>
            <div className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-center flex-shrink-0" style={{ background: "#3D5A50", color: "#FFF", minWidth: "64px" }}>
              {it.date || "—"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "#3D3A34" }}>{it.title}</div>
              {it.note && <div className="text-xs" style={{ color: "#8A8073" }}>{it.note}</div>}
            </div>
            <button onClick={() => onDel(it.id)}>
              <Trash2 size={16} color="#C97B4A" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "#F7F3EC", color: "#3D3A34", border: "1px solid #E5DFD3" }}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.dateTitlePlaceholder}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "#F7F3EC", color: "#3D3A34", border: "1px solid #E5DFD3" }}
          />
        </div>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.noteHint}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "#F7F3EC", color: "#3D3A34", border: "1px solid #E5DFD3" }}
          />
          <button
            onClick={() => {
              onAdd(title, date, note);
              setTitle("");
              setDate("");
              setNote("");
            }}
            className="px-4 rounded-xl text-sm font-semibold"
            style={{ background: "#3D5A50", color: "#FFF" }}
          >
            {t.add}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

function NotesTab({ t, items, onAdd, onDel }) {
  const [val, setVal] = useState("");
  return (
    <SectionCard>
      <div className="flex flex-col gap-2 mb-3">
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={{ background: "#F7F3EC", color: "#3D3A34", border: "1px solid #E5DFD3" }}
        />
        <button
          onClick={() => {
            onAdd(val);
            setVal("");
          }}
          className="self-end px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#3D5A50", color: "#FFF" }}
        >
          {t.add}
        </button>
      </div>

      {items.length === 0 && <p className="text-sm text-center py-3" style={{ color: "#B0A896" }}>{t.empty.notes}</p>}
      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "#FBF6EC", borderInlineStart: "3px solid #C97B4A" }}>
            <p className="flex-1 text-sm whitespace-pre-wrap" style={{ color: "#3D3A34" }}>{n.text}</p>
            <button onClick={() => onDel(n.id)}>
              <Trash2 size={15} color="#C97B4A" />
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
