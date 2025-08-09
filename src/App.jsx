import React, { useEffect, useMemo, useState } from "react";

// =====================
// Brillo & Co — Single-file React SPA (Pure JS, build-safe)
// Now with Formspree submission (direct send) + graceful mailto fallback.
// Fixes: no TS assertions; SSR-safe router; plain CSS; expanded smoke tests.
// =====================

const PALETTE = {
  ivory: "#FAFAF8",
  charcoal: "#222222",
  gold: "#D4AF37",
  sage: "#E5EDD7",
};

const WHATSAPP_NUMBER = "+528117991463"; // international format required by WA deep link

// ===== Submission config =====
// Options: 'formspree' | 'emailjs' | 'custom' | 'mailto_fallback'
const SUBMIT_MODE = 'formspree';
// TODO: replace with your real Formspree endpoint (after creating form and adding both recipients)
// Example: https://formspree.io/f/abcdwxyz
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqalwplo';
// If you later switch to a custom API, set CUSTOM_ENDPOINT below
const CUSTOM_ENDPOINT = '';

// ---------- i18n ----------
const DICT = {
  es: {
    brand: "Brillo & Co.",
    tagline: "Momentos que brillan para siempre",
    nav: { home: "Inicio", services: "Servicios", about: "Nosotros", booking: "Reserva", contact: "Contacto" },
    hero_cta: "Solicita disponibilidad",
    services_intro: "Servicios",
    camera_title: "Alquiler de cámaras tipo Polaroid",
    camera_desc: "Cámaras instantáneas premium con paquetes de película y mesa de firmas.",
    photobooth_title: "Servicio de fotocabina",
    photobooth_desc: "Cabina elegante con iluminación profesional, props curados y asistente.",
    flowerwall_title: "Alquiler de muro de flores",
    flowerwall_desc: "Muros florales de lujo en tonos neutros o personalizados.",
    view_more: "Ver más",
    why_title: "Por qué elegirnos",
    why_points: ["Experiencia de lujo", "Servicio bilingüe", "Paquetes personalizados", "Proceso sin complicaciones"],
    booking_title: "Solicitud de reserva",
    booking_intro: "Cuéntanos sobre tu evento y confirmaremos disponibilidad.",
    form: {
      name: "Nombre",
      email: "Correo electrónico",
      whatsapp: "WhatsApp",
      date: "Fecha del evento",
      location: "Ubicación / Venue",
      services: "Servicios",
      details: "Detalles adicionales",
      submit: "Enviar solicitud",
      open_whatsapp: "Chatear por WhatsApp",
      services_list: ["Cámaras tipo Polaroid", "Fotocabina", "Muro de flores"],
      success: "¡Gracias! Hemos recibido tu solicitud. Te responderemos por correo o WhatsApp pronto.",
      error: "Lo sentimos, hubo un error al enviar. Intenta de nuevo o escríbenos por WhatsApp.",
    },
    about_title: "Sobre Brillo & Co.",
    about_body: "Somos un equipo familiar que diseña experiencias memorables para bodas y eventos de alto nivel. Cuidamos cada detalle con un enfoque minimalista y elegante.",
    contact_title: "Contacto",
    contact_body: "Escríbenos para cotizaciones y disponibilidad.",
    footer_rights: "Todos los derechos reservados",
    gallery_title: "Galería (próximamente)",
    testimonials_title: "Testimonios (próximamente)",
  },
  en: {
    brand: "Brillo & Co.",
    tagline: "Moments that shine forever",
    nav: { home: "Home", services: "Services", about: "About", booking: "Booking", contact: "Contact" },
    hero_cta: "Check availability",
    services_intro: "Services",
    camera_title: "Polaroid‑Style Camera Rentals",
    camera_desc: "Premium instant cameras with film bundles and a guestbook table.",
    photobooth_title: "Photobooth Service",
    photobooth_desc: "Elegant booth with pro lighting, curated props, and on‑site attendant.",
    flowerwall_title: "Flower Wall Rental",
    flowerwall_desc: "Luxury floral walls in neutral palettes or custom colors.",
    view_more: "View more",
    why_title: "Why choose us",
    why_points: ["Luxury experience", "Bilingual service", "Tailored packages", "Seamless process"],
    booking_title: "Booking request",
    booking_intro: "Tell us about your event and we’ll confirm availability.",
    form: {
      name: "Name",
      email: "Email",
      whatsapp: "WhatsApp",
      date: "Event date",
      location: "Location / Venue",
      services: "Services",
      details: "Additional details",
      submit: "Send request",
      open_whatsapp: "Chat on WhatsApp",
      services_list: ["Polaroid‑style Cameras", "Photobooth", "Flower Wall"],
      success: "Thanks! Your request was received. We’ll reply by email or WhatsApp soon.",
      error: "Sorry, something went wrong. Please try again or message us on WhatsApp.",
    },
    about_title: "About Brillo & Co.",
    about_body: "We’re a family team crafting memorable, high‑end experiences for weddings and events. We obsess over details with a minimalist, elegant touch.",
    contact_title: "Contact",
    contact_body: "Reach out for quotes and availability.",
    footer_rights: "All rights reserved",
    gallery_title: "Gallery (coming soon)",
    testimonials_title: "Testimonials (coming soon)",
  },
};

// ---------- Routing helpers (SSR-safe) ----------
function parseHash(hash) {
  const h = hash || "#/";
  if (typeof h !== "string") return "";
  return h.startsWith("#/") ? (h.slice(2) || "") : h;
}
const getHashRoute = () => (typeof window === "undefined" ? "" : parseHash(window.location.hash));

const useRoute = () => {
  const [route, setRoute] = useState(getHashRoute());
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash) window.location.hash = "#/";
    const onHash = () => setRoute(getHashRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (r) => { if (typeof window !== "undefined") window.location.hash = `#/${r}`; };
  return [route, navigate];
};

// ---------- Utilities ----------
const useLang = () => { const [lang, setLang] = useState("es"); return { lang, setLang, t: useMemo(() => DICT[lang], [lang]) }; };

const validateEmail = (email) => /.+@.+\\..+/.test(String(email||'').trim());

const buildEmailHref = (values) => {
  // Kept for fallback only
  const to = "hola@brilloandco.com";
  const subject = encodeURIComponent(`Reserva — ${values.name || "Sin nombre"}`);
  const lines = [
    `Nombre: ${values.name}`,
    `Email: ${values.email}`,
    `WhatsApp: ${values.whatsapp}`,
    `Fecha: ${values.date}`,
    `Ubicación: ${values.location}`,
    `Servicios: ${(values.services || []).join(", ")}`,
    "",
    values.details || "",
  ];
  return `mailto:${to}?subject=${subject}&body=${encodeURIComponent(lines.join("\\n"))}`;
};

const buildWhatsAppHref = (values, lang) => {
  const msg = lang === "es"
    ? `Hola Brillo & Co., me gustaría reservar:\\n\\nNombre: ${values.name}\\nEmail: ${values.email}\\nWhatsApp: ${values.whatsapp}\\nFecha: ${values.date}\\nUbicación: ${values.location}\\nServicios: ${(values.services||[]).join(", ")}\\n\\n${values.details||""}`
    : `Hello Brillo & Co., I’d like to book:\\n\\nName: ${values.name}\\nEmail: ${values.email}\\nWhatsApp: ${values.whatsapp}\\nDate: ${values.date}\\nLocation: ${values.location}\\nServices: ${(values.services||[]).join(", ")}\\n\\n${values.details||""}`;
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g, "")}?text=${encodeURIComponent(msg)}`;
};

const openWhatsAppPrefilled = (values, lang) => {
  const href = buildWhatsAppHref(values, lang);
  if (typeof window !== "undefined") window.open(href, "_blank");
};

// Submit to Formspree / custom / fallback
async function submitBooking(values) {
  const payload = {
    name: values.name,
    email: values.email,
    whatsapp: values.whatsapp,
    date: values.date,
    location: values.location,
    services: (values.services||[]).join(", "),
    details: values.details,
    // meta
    source: "brilloandco.com",
    timestamp: new Date().toISOString(),
  };

  if (SUBMIT_MODE === 'formspree') {
    if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('XXXX')) throw new Error('Formspree endpoint not configured');
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Formspree request failed');
    const data = await res.json().catch(() => ({}));
    return data;
  }

  if (SUBMIT_MODE === 'custom' && CUSTOM_ENDPOINT) {
    const res = await fetch(CUSTOM_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Custom endpoint failed');
    return await res.json().catch(() => ({}));
  }

  const href = buildEmailHref(values);
  if (typeof window !== 'undefined') window.location.href = href;
  return { fallback: 'mailto' };
}

// ---------- UI ----------
const Header = ({ t, lang, setLang, current }) => (
  <header className="sticky top-0 z-40 backdrop-blur bg-[rgba(250,250,248,0.8)] border-b border-black/5">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="#/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full" style={{ background: PALETTE.sage }} />
        <span className="font-serif text-xl tracking-wide">{t.brand}</span>
      </a>
      <nav className="hidden md:flex items-center gap-1">
        <NavLink to="" current={current}>{t.nav.home}</NavLink>
        <NavLink to="services" current={current}>{t.nav.services}</NavLink>
        <NavLink to="about" current={current}>{t.nav.about}</NavLink>
        <NavLink to="booking" current={current}>{t.nav.booking}</NavLink>
        <NavLink to="contact" current={current}>{t.nav.contact}</NavLink>
      </nav>
      <div className="flex items-center gap-2">
        <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="px-3 py-1 rounded-lg border border-black/10 hover:border-black/20 text-sm" aria-label="Language toggle">{lang === "es" ? "ES / EN" : "EN / ES"}</button>
        <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g, "")}`} target="_blank" className="hidden md:inline-flex px-3 py-1 rounded-lg text-sm" style={{ background: PALETTE.gold, color: "#000" }}>WhatsApp</a>
      </div>
    </div>
  </header>
);

const NavLink = ({ to, children, current }) => (
  <a href={`#/${to}`} className={`px-3 py-2 rounded-xl text-sm md:text-base transition ${current === to ? "bg-black/5" : "hover:bg-black/5"}`}>{children}</a>
);

const Hero = ({ t, lang }) => (
  <section className="relative">
    <div className="absolute inset-0">
      <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529634899531-02f46a56f3f7?q=80&w=1600&auto=format&fit=crop')", filter: "grayscale(15%)" }} />
      <div className="absolute inset-0" style={{ background: "rgba(34,34,34,0.35)" }} />
    </div>
    <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-white">
      <h1 className="font-serif text-4xl md:text-6xl leading-tight drop-shadow-sm">{t.tagline}</h1>
      <p className="mt-4 text-lg md:text-xl opacity-90">{lang === 'es' ? "Alquiler de cámaras tipo Polaroid, fotocabina y muros de flores para bodas y eventos de lujo." : "Polaroid‑style camera rentals, photobooth service, and flower walls for luxury weddings and events."}</p>
      <div className="mt-8 flex gap-3">
        <a href="#/booking" className="px-5 py-3 rounded-xl font-medium" style={{ background: PALETTE.gold, color: "#000" }}>{t.hero_cta}</a>
        <a href="#/services" className="px-5 py-3 rounded-xl font-medium bg-white/10 border border-white/20 hover:bg-white/20">{t.nav.services}</a>
      </div>
    </div>
  </section>
);

const ServicesOverview = ({ t }) => (
  <section className="max-w-6xl mx-auto px-4 py-16">
    <h2 className="font-serif text-3xl mb-8">{t.services_intro}</h2>
    <div className="grid md:grid-cols-3 gap-6">
      <ServiceCard href="#/services#cameras" img="https://images.unsplash.com/photo-1500522144261-ea64433bbe27?q=80&w=1200&auto=format&fit=crop" title={t.camera_title} desc={t.camera_desc} cta={t.view_more} />
      <ServiceCard href="#/services#photobooth" img="https://images.unsplash.com/photo-1553925585-5f03a7b4c5e2?q=80&w=1200&auto=format&fit=crop" title={t.photobooth_title} desc={t.photobooth_desc} cta={t.view_more} />
      <ServiceCard href="#/services#flowerwall" img="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop" title={t.flowerwall_title} desc={t.flowerwall_desc} cta={t.view_more} />
    </div>
  </section>
);

const ServiceCard = ({ href, img, title, desc, cta }) => (
  <a href={href} className="group rounded-2xl overflow-hidden border border-black/10 bg-white shadow-sm hover:shadow-md transition block">
    <div className="aspect-[4/3] bg-center bg-cover" style={{ backgroundImage: `url(${img})` }} />
    <div className="p-5">
      <h3 className="font-serif text-xl mb-2">{title}</h3>
      <p className="text-sm text-black/70 min-h-[3.5rem]">{desc}</p>
      <span className="inline-block mt-4 font-medium" style={{ color: PALETTE.gold }}>→ {cta}</span>
    </div>
  </a>
);

const WhyUs = ({ t }) => (
  <section className="py-16" style={{ background: PALETTE.sage }}>
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="font-serif text-3xl mb-8">{t.why_title}</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {t.why_points.map((p, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 border border-black/10"><p className="font-medium">{p}</p></div>
        ))}
      </div>
    </div>
  </section>
);

const BookingCTA = ({ t }) => (
  <section className="py-16">
    <div className="max-w-6xl mx-auto px-4">
      <div className="rounded-2xl p-8 md:p-12 border border-black/10" style={{ background: PALETTE.sage }}>
        <h3 className="font-serif text-2xl mb-3">{t.booking_title}</h3>
        <p className="mb-6 text-black/70">{t.booking_intro}</p>
        <div className="flex flex-wrap gap-3">
          <a href="#/booking" className="px-5 py-3 rounded-xl font-medium" style={{ background: PALETTE.gold, color: "#000" }}>{t.form.submit}</a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g, "")}`} target="_blank" className="px-5 py-3 rounded-xl font-medium border border-black/20 bg-white hover:bg-white/80">{t.form.open_whatsapp}</a>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ t }) => (
  <footer className="mt-20 border-t border-black/10">
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full" style={{ background: PALETTE.sage }} /><span className="font-serif">{t.brand}</span></div>
      <p className="text-sm text-black/60">© {new Date().getFullYear()} {t.brand}. {t.footer_rights}.</p>
      <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g, "")}`} target="_blank" className="text-sm underline">WhatsApp</a>
    </div>
  </footer>
);

// ---------- Pages ----------
const Home = ({ t, lang }) => (<main><Hero t={t} lang={lang} /><ServicesOverview t={t} /><WhyUs t={t} /><BookingCTA t={t} /></main>);

const Services = ({ t }) => (
  <main className="max-w-6xl mx-auto px-4 py-12">
    <h1 className="font-serif text-3xl mb-8">{t.services_intro}</h1>

    <section id="cameras" className="mb-12">
      <h2 className="font-serif text-2xl mb-2">{t.camera_title}</h2>
      <p className="text-black/70 mb-4">{t.camera_desc}</p>
      <ul className="list-disc pl-5 text-black/70 space-y-1 mb-4">
        <li>{t === DICT.es ? "Cámaras instantáneas premium (Instax/Polaroid)." : "Premium instant cameras (Instax/Polaroid)."}</li>
        <li>{t === DICT.es ? "Paquetes de película a elección." : "Film bundles to choose from."}</li>
        <li>{t === DICT.es ? "Mesa de firmas y álbum opcional." : "Optional guestbook & signing table."}</li>
      </ul>
      <a href="#/booking" className="inline-block px-4 py-2 rounded-lg" style={{ background: PALETTE.gold, color: "#000" }}>{t.form.submit}</a>
    </section>

    <section id="photobooth" className="mb-12">
      <h2 className="font-serif text-2xl mb-2">{t.photobooth_title}</h2>
      <p className="text-black/70 mb-4">{t.photobooth_desc}</p>
      <ul className="list-disc pl-5 text-black/70 space-y-1 mb-4">
        <li>{t === DICT.es ? "Impresiones o galería digital instantánea." : "Instant prints or digital gallery."}</li>
        <li>{t === DICT.es ? "Iluminación profesional y fondo elegante." : "Pro lighting and chic backdrop."}</li>
        <li>{t === DICT.es ? "Asistente en sitio." : "On-site attendant."}</li>
      </ul>
      <a href="#/booking" className="inline-block px-4 py-2 rounded-lg" style={{ background: PALETTE.gold, color: "#000" }}>{t.form.submit}</a>
    </section>

    <section id="flowerwall" className="mb-12">
      <h2 className="font-serif text-2xl mb-2">{t.flowerwall_title}</h2>
      <p className="text-black/70 mb-4">{t.flowerwall_desc}</p>
      <ul className="list-disc pl-5 text-black/70 space-y-1 mb-4">
        <li>{t === DICT.es ? "Tonos neutros o personalizados." : "Neutral or custom palettes."}</li>
        <li>{t === DICT.es ? "Instalación y desmontaje incluidos." : "Setup and teardown included."}</li>
        <li>{t === DICT.es ? "Opciones de tamaño y estilos." : "Size and style options."}</li>
      </ul>
      <a href="#/booking" className="inline-block px-4 py-2 rounded-lg" style={{ background: PALETTE.gold, color: "#000" }}>{t.form.submit}</a>
    </section>
  </main>
);

const About = ({ t }) => (<main className="max-w-4xl mx-auto px-4 py-12"><h1 className="font-serif text-3xl mb-4">{t.about_title}</h1><p className="text-black/70 leading-relaxed">{t.about_body}</p></main>);

const Contact = ({ t }) => (
  <main className="max-w-4xl mx-auto px-4 py-12">
    <h1 className="font-serif text-3xl mb-4">{t.contact_title}</h1>
    <p className="text-black/70 mb-6">{t.contact_body}</p>
    <div className="flex flex-col gap-3">
      <a className="underline" href="mailto:hola@brilloandco.com">hola@brilloandco.com</a>
      <a className="underline" href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g, "")}`} target="_blank">WhatsApp</a>
    </div>
  </main>
);

const Booking = ({ t, lang }) => {
  const [values, setValues] = useState({ name: "", email: "", whatsapp: "", date: "", location: "", services: [], details: "", hp: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ ok: false, error: '' });

  const toggleService = (label) => setValues((v) => ({ ...v, services: v.services.includes(label) ? v.services.filter((s) => s !== label) : [...v.services, label] }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (values.hp) return; // honeypot
    if (!validateEmail(values.email)) { setStatus({ ok: false, error: 'Invalid email' }); return; }
    try {
      setLoading(true);
      await submitBooking(values);
      setStatus({ ok: true, error: '' });
      setValues({ name: "", email: "", whatsapp: "", date: "", location: "", services: [], details: "", hp: "" });
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, error: 'submit_failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl mb-2">{t.booking_title}</h1>
      <p className="text-black/70 mb-8">{t.booking_intro}</p>

      {status.ok && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-50 p-4 text-green-800">
          {t.form.success}
        </div>
      )}
      {status.error && !status.ok && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-50 p-4 text-red-800">
          {t.form.error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* honeypot */}
        <input type="text" value={values.hp} onChange={(e)=>setValues({...values, hp: e.target.value})} className="hidden" tabIndex="-1" autoComplete="off" aria-hidden="true" />

        <div className="grid md:grid-cols-2 gap-5">
          <Field label={t.form.name}><input required className="input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} /></Field>
          <Field label={t.form.email}><input required type="email" className="input" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} /></Field>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label={t.form.whatsapp}><input required className="input" placeholder="+52…" value={values.whatsapp} onChange={(e) => setValues({ ...values, whatsapp: e.target.value })} /></Field>
          <Field label={t.form.date}><input required type="date" className="input" value={values.date} onChange={(e) => setValues({ ...values, date: e.target.value })} /></Field>
        </div>
        <Field label={t.form.location}><input className="input" placeholder={lang === 'es' ? 'Ciudad / venue' : 'City / venue'} value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} /></Field>
        <Field label={t.form.services}>
          <div className="grid md:grid-cols-3 gap-3">
            {t.form.services_list.map((label) => (
              <label key={label} className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer ${values.services.includes(label) ? 'border-black/70 bg-black/5' : 'border-black/10 hover:border-black/30'}`}>
                <input type="checkbox" checked={values.services.includes(label)} onChange={() => toggleService(label)} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={t.form.details}><textarea className="input min-h-[120px]" value={values.details} onChange={(e) => setValues({ ...values, details: e.target.value })} /></Field>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl font-medium disabled:opacity-60" style={{ background: PALETTE.gold, color: "#000" }}>
            {loading ? (lang === 'es' ? 'Enviando…' : 'Sending…') : t.form.submit}
          </button>
          <button type="button" onClick={() => openWhatsAppPrefilled(values, lang)} className="px-5 py-3 rounded-xl font-medium border border-black/20 bg-white hover:bg-white/80">{t.form.open_whatsapp}</button>
        </div>
      </form>
    </main>
  );
};

const Field = ({ label, children }) => (<label className="block"><span className="block mb-2 text-sm font-medium">{label}</span>{children}</label>);

// ---------- Global styles (plain CSS for runtime safety) ----------
const GlobalStyles = () => (
  <style>{`
    .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(0,0,0,.1); background: #fff; padding: 0.75rem 1rem; outline: none; }
    .input:focus { outline: 2px solid ${PALETTE.gold}; border-color: rgba(0,0,0,.2); }
    body { background: ${PALETTE.ivory}; color: ${PALETTE.charcoal}; }
    .font-serif { font-family: 'Playfair Display', ui-serif, Georgia, serif; }
  `}</style>
);

// ---------- Smoke tests (build/run-time checks) ----------
const runSmokeTests = () => {
  try {
    console.assert(!!DICT.es && !!DICT.en, "i18n dictionaries present");
    console.assert(Array.isArray(DICT.es.form.services_list), "services list ES ok");
    console.assert(Array.isArray(DICT.en.form.services_list), "services list EN ok");
    const href = buildEmailHref({ name: "Test", email: "a@b.com", whatsapp: "+520000000000", date: "2025-12-31", location: "Oaxaca", services: ["Photobooth"], details: "details" });
    console.assert(href.startsWith("mailto:"), "mailto href built");
    console.assert(parseHash("#/") === "", "parseHash root");
    console.assert(parseHash("#/services") === "services", "parseHash services");
    console.assert(parseHash("") === "", "parseHash empty defaults to root");
    const w = buildWhatsAppHref({ name: "T", email: "t@x.com", whatsapp: "+52000", date: "2025-01-01", location: "OX", services: ["A"], details: "B" }, "en");
    console.assert(w.startsWith("https://wa.me/" + WHATSAPP_NUMBER.replace(/\\D/g, "")), "wa href built");
    console.assert(['formspree','emailjs','custom','mailto_fallback'].includes(SUBMIT_MODE), 'valid SUBMIT_MODE');
  } catch (e) {
    console.warn("Smoke tests failed:", e);
  }
};

// ---------- App ----------
export default function App() {
  const { lang, setLang, t } = useLang();
  const [route] = useRoute();

  useEffect(() => { runSmokeTests(); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalStyles />
      <Header t={t} lang={lang} setLang={setLang} current={route} />
      <div className="flex-1">
        {route === "" && <Home t={t} lang={lang} />}
        {route === "services" && <Services t={t} />}
        {route === "about" && <About t={t} />}
        {route === "booking" && <Booking t={t} lang={lang} />}
        {route === "contact" && <Contact t={t} />}
      </div>
      <Footer t={t} />

      {/* Floating WhatsApp button */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\\D/g, "")}`} target="_blank" className="fixed bottom-6 right-6 rounded-full shadow-lg w-14 h-14 flex items-center justify-center border border-black/10" style={{ background: PALETTE.gold }} aria-label="WhatsApp">
        <span className="sr-only">WhatsApp</span>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.94 11.94 0 0 0 12 .5C5.65.5.5 5.65.5 12c0 2.03.53 4.01 1.53 5.76L.5 23.5l5.9-1.5A11.43 11.43 0 0 0 12 23.5c6.35 0 11.5-5.15 11.5-11.5 0-3.07-1.2-5.96-3.48-8.02ZM12 21.25c-1.84 0-3.63-.5-5.2-1.45l-.37-.22-3.5.9.93-3.4-.24-.39A9.7 9.7 0 0 1 2.75 12C2.75 6.57 7.07 2.25 12 2.25S21.25 6.57 21.25 12 16.93 21.25 12 21.25Zm5.07-6.2c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.09-.17.19-.33.21-.61.07-.28-.14-1.19-.44-2.26-1.4-.83-.74-1.39-1.64-1.55-1.92-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.55-.88-2.13-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.49.07-.74.35-.26.28-1 1-1 2.43 0 1.43 1.02 2.81 1.17 3 .14.19 2.01 3.06 4.87 4.28.68.29 1.21.46 1.62.58.68.22 1.31.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.18-.54-.32Z" fill="#000"/></svg>
      </a>
    </div>
  );
}
