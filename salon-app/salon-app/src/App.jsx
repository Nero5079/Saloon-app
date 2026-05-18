import { useState } from "react";

// ─── CONFIG (replace with your real values) ────────────────────────────────
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL    = "admin@salon.com";   // change this
const ADMIN_PASSWORD = "admin123";           // change this
const YOUR_UPI_ID    = "yoursalon@upi";     // change to your FamPay/UPI ID
const SALON_NAME     = "Glamour Studio";

// ─── DATA ──────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 1, name: "Haircut",     price: 299,  duration: "30 min", icon: "✂️" },
  { id: 2, name: "Facial",      price: 599,  duration: "60 min", icon: "✨" },
  { id: 3, name: "Hair colour", price: 999,  duration: "90 min", icon: "🎨" },
  { id: 4, name: "Manicure",    price: 399,  duration: "45 min", icon: "💅" },
  { id: 5, name: "Massage",     price: 799,  duration: "60 min", icon: "💆" },
  { id: 6, name: "Waxing",      price: 349,  duration: "30 min", icon: "🌸" },
];

const SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00",
];

const DEMO_BOOKINGS = [
  { id: 1, customer: "Anita Mehta",  phone: "9812345678", service: "Facial",      price: 599, date: new Date().toISOString().split("T")[0], slot: "10:00", status: "confirmed", paid: true  },
  { id: 2, customer: "Riya Patel",   phone: "9811234567", service: "Haircut",     price: 299, date: new Date().toISOString().split("T")[0], slot: "11:30", status: "pending",   paid: false },
  { id: 3, customer: "Meera Singh",  phone: "9800011122", service: "Manicure",    price: 399, date: new Date().toISOString().split("T")[0], slot: "14:00", status: "confirmed", paid: false },
];

// ─── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const today = new Date().toISOString().split("T")[0];

  const [screen,    setScreen]    = useState("login");   // login | customer | admin
  const [tab,       setTab]       = useState("customer");
  const [user,      setUser]      = useState(null);
  const [bookings,  setBookings]  = useState(DEMO_BOOKINGS);
  const [form,      setForm]      = useState({ name:"", phone:"", email:"", password:"" });
  const [selSvc,    setSelSvc]    = useState(null);
  const [selDate,   setSelDate]   = useState(today);
  const [selSlot,   setSelSlot]   = useState(null);
  const [payStep,   setPayStep]   = useState(false);
  const [onLeave,   setOnLeave]   = useState(false);
  const [leaveMsg,  setLeaveMsg]  = useState("Owner is on leave today. Please check back tomorrow.");
  const [filter,    setFilter]    = useState("all");
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [copied,    setCopied]    = useState(false);

  // ── AUTH ────────────────────────────────────────────────────────────────
  function loginCustomer() {
    if (!form.name.trim() || !form.phone.trim()) { setError("Please fill in both fields"); return; }
    setUser({ name: form.name.trim(), phone: form.phone.trim() });
    setScreen("customer"); setError("");
  }
  function loginAdmin() {
    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      setUser({ name: "Owner", role: "admin" }); setScreen("admin"); setError("");
    } else { setError("Wrong credentials"); }
  }
  function logout() {
    setUser(null); setScreen("login"); setSelSvc(null); setSelSlot(null);
    setPayStep(false); setSuccess(""); setError("");
    setForm({ name:"", phone:"", email:"", password:"" });
  }

  // ── CUSTOMER ACTIONS ────────────────────────────────────────────────────
  function bookedSlots(date) {
    return bookings.filter(b => b.date === date && b.status !== "cancelled").map(b => b.slot);
  }
  function doBooking() {
    const nb = { id: Date.now(), customer: user.name, phone: user.phone,
      service: selSvc.name, price: selSvc.price, date: selDate,
      slot: selSlot, status: "pending", paid: false };
    setBookings(p => [...p, nb]);
    setSelSvc(null); setSelSlot(null); setPayStep(false);
    setSuccess("Booking sent! Owner will confirm shortly."); 
    setTimeout(() => setSuccess(""), 4000);
  }
  function cancelBk(id) { setBookings(p => p.map(b => b.id===id ? {...b, status:"cancelled"} : b)); }

  // ── ADMIN ACTIONS ───────────────────────────────────────────────────────
  function adminAction(id, status) { setBookings(p => p.map(b => b.id===id ? {...b, status} : b)); }
  function markPaid(id)            { setBookings(p => p.map(b => b.id===id ? {...b, paid:true} : b)); }

  // ── DERIVED ─────────────────────────────────────────────────────────────
  const myBookings    = bookings.filter(b => b.customer === user?.name);
  const filtered      = filter==="all" ? bookings : bookings.filter(b => b.status===filter);
  const todayBks      = bookings.filter(b => b.date===today && b.status!=="cancelled");
  const pendingCount  = bookings.filter(b => b.status==="pending").length;
  const confirmedCount= bookings.filter(b => b.status==="confirmed").length;
  const revenue       = bookings.filter(b => b.status==="confirmed" && b.paid).reduce((a,b)=>a+b.price, 0);

  // ── STYLES ──────────────────────────────────────────────────────────────
  const G = "#1D9E75"; // primary green
  const GL = "#E1F5EE";
  const GD = "#0F6E56";

  const css = {
    page:   { fontFamily:"var(--font-sans)", minHeight:"100vh", background:"var(--color-background-tertiary)" },
    wrap:   { maxWidth:680, margin:"0 auto", padding:"1.5rem 1rem" },
    card:   { background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"1.25rem", marginBottom:"1rem" },
    topbar: { background:"var(--color-background-primary)", borderBottom:"0.5px solid var(--color-border-tertiary)", padding:"0 1rem", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 },
    btn:    { padding:"11px 20px", background:G, color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer", width:"100%" },
    btnSm:  { padding:"6px 12px", background:"transparent", border:"0.5px solid var(--color-border-secondary)", borderRadius:8, fontSize:12, color:"var(--color-text-secondary)", cursor:"pointer" },
    input:  { width:"100%", padding:"10px 12px", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:14, marginTop:6, marginBottom:12, display:"block" },
    lbl:    { fontSize:12, fontWeight:500, color:"var(--color-text-secondary)" },
    sec:    { fontSize:11, fontWeight:500, color:"var(--color-text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 },
    badge:  (s) => ({ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:500,
                background: s==="confirmed"?"#E1F5EE":s==="cancelled"?"#FCEBEB":s==="pending"?"#FAEEDA":"#E6F1FB",
                color:      s==="confirmed"?"#0F6E56":s==="cancelled"?"#A32D2D":s==="pending"?"#854F0B":"#185FA5" }),
  };

  // ── TOP BAR ─────────────────────────────────────────────────────────────
  const Bar = () => (
    <div style={css.topbar}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:15, fontWeight:500 }}>✂️ {SALON_NAME}</span>
        <span style={{ ...css.badge(screen==="admin"?"admin":"customer"), background: screen==="admin"?GL:"#E6F1FB", color: screen==="admin"?GD:"#185FA5" }}>
          {screen==="admin" ? "Admin" : "Customer"}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:13, color:"var(--color-text-secondary)" }}>{user?.name}</span>
        <button style={css.btnSm} onClick={logout}>Logout</button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "login") return (
    <div style={css.page}>
      <div style={{ maxWidth:400, margin:"0 auto", padding:"3rem 1rem" }}>
        <div style={css.card}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ fontSize:40, marginBottom:8 }}>✂️</div>
            <h1 style={{ fontSize:22, fontWeight:500 }}>{SALON_NAME}</h1>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginTop:4 }}>Book appointments online</p>
          </div>

          {/* Tab switcher */}
          <div style={{ display:"flex", gap:6, background:"var(--color-background-secondary)", borderRadius:8, padding:4, marginBottom:"1.5rem" }}>
            {["customer","admin"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{ flex:1, padding:"8px 0", border: tab===t ? "0.5px solid var(--color-border-tertiary)" : "none",
                  background: tab===t ? "var(--color-background-primary)" : "transparent",
                  borderRadius:6, fontSize:13, fontWeight: tab===t ? 500 : 400,
                  color: tab===t ? "var(--color-text-primary)" : "var(--color-text-secondary)", cursor:"pointer" }}>
                {t==="customer" ? "I'm a Customer" : "I'm the Owner"}
              </button>
            ))}
          </div>

          {tab === "customer" ? (
            <>
              <label style={css.lbl}>Your name</label>
              <input style={css.input} placeholder="Priya Sharma" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
              <label style={css.lbl}>Phone number</label>
              <input style={css.input} placeholder="9876543210" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&loginCustomer()} />
              <button style={css.btn} onClick={loginCustomer}>Book an appointment →</button>
            </>
          ) : (
            <>
              <label style={css.lbl}>Email</label>
              <input style={css.input} placeholder="admin@salon.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} />
              <label style={css.lbl}>Password</label>
              <input style={css.input} type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&loginAdmin()} />
              <button style={css.btn} onClick={loginAdmin}>Enter admin panel →</button>
              <p style={{ fontSize:11, color:"var(--color-text-tertiary)", textAlign:"center", marginTop:10 }}>Demo: admin@salon.com / admin123</p>
            </>
          )}
          {error && <p style={{ fontSize:12, color:"#A32D2D", marginTop:8 }}>{error}</p>}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // CUSTOMER SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "customer") return (
    <div style={css.page}>
      <Bar />
      <div style={css.wrap}>

        {/* Leave notice */}
        {onLeave && (
          <div style={{ background:"#FAEEDA", border:"0.5px solid #FAC775", borderRadius:8, padding:"12px 16px", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:"#854F0B" }}>Salon closed today</div>
              <div style={{ fontSize:12, color:"#BA7517", marginTop:2 }}>{leaveMsg}</div>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={{ background:GL, border:"0.5px solid #9FE1CB", borderRadius:8, padding:"12px 16px", marginBottom:"1.5rem" }}>
            <p style={{ fontSize:13, color:GD, fontWeight:500 }}>✅ {success}</p>
          </div>
        )}

        {/* Services */}
        <p style={css.sec}>Choose a service</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:"1.5rem" }}>
          {SERVICES.map(svc => (
            <div key={svc.id}
              onClick={() => !onLeave && setSelSvc(selSvc?.id===svc.id ? null : svc)}
              style={{ background: selSvc?.id===svc.id ? GL : "var(--color-background-primary)",
                border: selSvc?.id===svc.id ? `1.5px solid ${G}` : "0.5px solid var(--color-border-tertiary)",
                borderRadius:12, padding:"1rem", cursor: onLeave ? "not-allowed" : "pointer",
                opacity: onLeave ? 0.5 : 1, transition:"all 0.15s" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{svc.icon}</div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)" }}>{svc.name}</div>
              <div style={{ fontSize:13, color:G, fontWeight:500, marginTop:4 }}>₹{svc.price}</div>
              <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{svc.duration}</div>
            </div>
          ))}
        </div>

        {/* Booking form */}
        {selSvc && !onLeave && (
          <div style={css.card}>
            <p style={{ fontSize:15, fontWeight:500, marginBottom:"1rem" }}>
              Booking: <span style={{ color:G }}>{selSvc.name}</span> — ₹{selSvc.price}
            </p>

            <label style={css.lbl}>Select date</label>
            <input type="date" style={css.input} min={today} value={selDate}
              onChange={e => { setSelDate(e.target.value); setSelSlot(null); setPayStep(false); }} />

            <label style={css.lbl}>Select time slot</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8, marginBottom:"1rem" }}>
              {SLOTS.map(slot => {
                const taken = bookedSlots(selDate).includes(slot);
                return (
                  <button key={slot} disabled={taken}
                    onClick={() => { setSelSlot(slot); setPayStep(false); }}
                    style={{ padding:"7px 14px", borderRadius:8, fontSize:13, cursor: taken?"not-allowed":"pointer",
                      border: selSlot===slot ? `1.5px solid ${G}` : "0.5px solid var(--color-border-tertiary)",
                      background: taken ? "var(--color-background-secondary)" : selSlot===slot ? G : "var(--color-background-primary)",
                      color: taken ? "var(--color-text-tertiary)" : selSlot===slot ? "#fff" : "var(--color-text-primary)",
                      textDecoration: taken ? "line-through" : "none" }}>
                    {slot}{taken ? " ✗" : ""}
                  </button>
                );
              })}
            </div>

            {/* Confirm summary */}
            {selSlot && !payStep && (
              <>
                <div style={{ background:GL, border:`0.5px solid #9FE1CB`, borderRadius:8, padding:"12px 16px", marginBottom:"1rem" }}>
                  <p style={{ fontSize:13, color:"#085041" }}>
                    <strong>{selSvc.name}</strong> · {selDate} · {selSlot}<br/>
                    Total: <strong>₹{selSvc.price}</strong>
                  </p>
                </div>
                <button style={css.btn} onClick={() => setPayStep(true)}>Proceed to pay ₹{selSvc.price} →</button>
              </>
            )}

            {/* Payment step */}
            {payStep && (
              <div>
                <p style={{ fontSize:15, fontWeight:500, marginBottom:"1rem" }}>Pay ₹{selSvc.price} to confirm</p>
                <div style={{ background:"var(--color-background-secondary)", borderRadius:12, padding:"1.5rem", textAlign:"center", marginBottom:"1rem" }}>
                  {/* QR code placeholder — replace with your real QR image */}
                  <div style={{ width:130, height:130, background:"var(--color-background-primary)", margin:"0 auto 1rem", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", border:"0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ fontSize:11, color:"var(--color-text-secondary)", textAlign:"center", padding:8 }}>
                      Add your UPI<br/>QR code here
                    </div>
                  </div>
                  <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:8 }}>Or pay directly to UPI ID:</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <code style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)", background:"var(--color-background-primary)", padding:"6px 14px", borderRadius:6, border:"0.5px solid var(--color-border-tertiary)" }}>
                      {YOUR_UPI_ID}
                    </code>
                    <button style={css.btnSm} onClick={() => { navigator.clipboard?.writeText(YOUR_UPI_ID); setCopied(true); setTimeout(()=>setCopied(false),2000); }}>
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ fontSize:11, color:"var(--color-text-tertiary)", marginTop:8 }}>Amount: ₹{selSvc.price}</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ ...css.btnSm, flex:1, padding:"11px" }} onClick={() => setPayStep(false)}>← Back</button>
                  <button style={{ ...css.btn, flex:2 }} onClick={doBooking}>I've paid — Confirm →</button>
                </div>
                <p style={{ fontSize:11, color:"var(--color-text-tertiary)", textAlign:"center", marginTop:8 }}>
                  Owner verifies payment and confirms your booking
                </p>
              </div>
            )}
          </div>
        )}

        {/* My bookings */}
        <div style={{ marginTop:"1.5rem" }}>
          <p style={css.sec}>My bookings</p>
          {myBookings.length === 0
            ? <p style={{ fontSize:13, color:"var(--color-text-secondary)" }}>No bookings yet. Pick a service above to start.</p>
            : myBookings.slice().reverse().map(b => (
              <div key={b.id} style={{ ...css.card, display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{b.service}</div>
                  <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:3 }}>{b.date} · {b.slot} · ₹{b.price}</div>
                  <div style={{ fontSize:12, color: b.paid ? "#0F6E56" : "#854F0B", marginTop:3 }}>
                    {b.paid ? "✓ Payment received" : "⏳ Payment verification pending"}
                  </div>
                  {b.status === "pending" && (
                    <button style={{ ...css.btnSm, marginTop:8 }} onClick={() => cancelBk(b.id)}>Cancel booking</button>
                  )}
                </div>
                <span style={css.badge(b.status)}>{b.status}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // ADMIN SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "admin") return (
    <div style={css.page}>
      <Bar />
      <div style={css.wrap}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:"1.5rem" }}>
          {[
            { label:"Today's bookings", val: todayBks.length },
            { label:"Pending approval", val: pendingCount },
            { label:"Confirmed",        val: confirmedCount },
            { label:"Revenue collected",val: `₹${revenue}` },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--color-background-secondary)", borderRadius:8, padding:"1rem" }}>
              <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:500, color:"var(--color-text-primary)" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Leave toggle */}
        <div style={css.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: onLeave ? "1rem" : 0 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500 }}>Mark today as leave / holiday</div>
              <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>Customers will see a notice and cannot book</div>
            </div>
            <label style={{ position:"relative", width:44, height:24, flexShrink:0 }}>
              <input type="checkbox" checked={onLeave} onChange={e=>setOnLeave(e.target.checked)} style={{ opacity:0, width:0, height:0 }} />
              <span style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background: onLeave?"#E24B4A":"var(--color-border-secondary)", borderRadius:24, cursor:"pointer", transition:"0.2s", display:"block" }}>
                <span style={{ position:"absolute", height:18, width:18, left: onLeave?23:3, bottom:3, background:"#fff", borderRadius:"50%", transition:"0.2s", display:"block" }} />
              </span>
            </label>
          </div>
          {onLeave && (
            <input style={css.input} placeholder="Leave message for customers..." value={leaveMsg} onChange={e=>setLeaveMsg(e.target.value)} />
          )}
        </div>

        {/* Bookings table */}
        <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"1rem 1.25rem", borderBottom:"0.5px solid var(--color-border-tertiary)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <h3 style={{ fontSize:15, fontWeight:500 }}>All bookings</h3>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["all","pending","confirmed","cancelled"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding:"5px 10px", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, fontSize:12,
                    background: filter===f ? G : "transparent",
                    color:       filter===f ? "#fff" : "var(--color-text-secondary)", cursor:"pointer" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0
            ? <p style={{ padding:"1rem", fontSize:13, color:"var(--color-text-secondary)" }}>No bookings</p>
            : filtered.slice().reverse().map(b => (
              <div key={b.id} style={{ padding:"14px 1.25rem", borderBottom:"0.5px solid var(--color-border-tertiary)", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{b.customer}</div>
                  <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>
                    📞 {b.phone} · {b.service} · {b.date} · {b.slot}
                  </div>
                  <div style={{ fontSize:12, marginTop:2, color: b.paid ? "#0F6E56" : "#854F0B" }}>
                    {b.paid ? "✓ Payment received · ₹"+b.price : "⏳ Payment not verified · ₹"+b.price}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end", flexShrink:0 }}>
                  <span style={css.badge(b.status)}>{b.status}</span>
                  {b.status === "pending" && (
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={{ padding:"5px 10px", background:G, color:"#fff", border:"none", borderRadius:6, fontSize:12, cursor:"pointer" }} onClick={() => adminAction(b.id,"confirmed")}>Confirm</button>
                      <button style={{ ...css.btnSm, padding:"5px 10px" }} onClick={() => adminAction(b.id,"cancelled")}>Reject</button>
                    </div>
                  )}
                  {!b.paid && b.status !== "cancelled" && (
                    <button style={{ padding:"4px 10px", background:GL, color:GD, border:`0.5px solid #9FE1CB`, borderRadius:6, fontSize:12, cursor:"pointer" }} onClick={() => markPaid(b.id)}>
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
