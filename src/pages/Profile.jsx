import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const TABS = ["Profile", "Security", "Orders"];

export default function Profile() {
  const { token, user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [tab, setTab] = useState("Profile");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", profilePicture: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([{ data: u }, { data: o }]) => {
        setForm({ name: u.name||"", email: u.email||"", phone: u.phone||"", address: u.address||"", city: u.city||"", profilePicture: u.profilePicture||"" });
        setAvatarPreview(u.profilePicture || "");
        setOrders(o);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setAvatarPreview(ev.target.result); setForm((f) => ({ ...f, profilePicture: ev.target.result })); };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const { data } = await api.put("/api/users/me", form, { headers: { Authorization: `Bearer ${token}` } });
      updateUser({ name: data.name, email: data.email, profilePicture: data.profilePicture });
      setSuccess("Profile updated successfully");
    } catch (err) { setError(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) return setError("New passwords do not match");
    if (pwForm.newPassword.length < 6) return setError("Password must be at least 6 characters");
    setSaving(true);
    try {
      await api.put("/api/users/me/password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { setError(err.response?.data?.message || "Failed to change password"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: "4rem" }} />;

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const delivered = orders.filter(o => o.status === "delivered").length;
  const active = orders.filter(o => o.status === "pending" || o.status === "processing").length;

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring">
            {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="avatar-img" /> : <div className="avatar-placeholder">{form.name?.[0]?.toUpperCase() || "?"}</div>}
          </div>
          <button type="button" className="avatar-edit-btn" onClick={() => fileRef.current.click()} title="Change photo">📷</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
        </div>
        <div className="profile-header-info">
          <h1>{form.name}</h1>
          <p className="profile-email">{form.email}</p>
          <span className={`role-badge role-${authUser?.role}`}>{authUser?.role}</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="pstat"><span>{orders.length}</span><p>Total Orders</p></div>
        <div className="pstat"><span>NPR {totalSpent.toLocaleString()}</span><p>Total Spent</p></div>
        <div className="pstat"><span>{delivered}</span><p>Delivered</p></div>
        <div className="pstat"><span>{active}</span><p>Active</p></div>
      </div>

      <div className="profile-tabs">
        {TABS.map(t => (
          <button key={t} className={`profile-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setError(""); setSuccess(""); }}>{t}</button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      {tab === "Profile" && (
        <form onSubmit={handleProfileSave} className="profile-form-card">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email Address</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Phone Number</label><input placeholder="+977 98XXXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group">
              <label>City</label>
              <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                <option value="">Select city</option>
                {["Kathmandu","Pokhara","Lalitpur","Bhaktapur","Biratnagar","Butwal","Dharan"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Delivery Address</label><textarea rows={2} placeholder="Street, Tole, Landmark..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="avatar-upload-row">
              <button type="button" className="btn btn-outline" onClick={() => fileRef.current.click()}>📷 Choose Photo from Device</button>
              {avatarPreview && <span className="upload-status">Photo selected</span>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      )}

      {tab === "Security" && (
        <form onSubmit={handlePasswordSave} className="profile-form-card">
          <h2>Change Password</h2>
          <p className="form-hint">Use at least 6 characters mixing letters and numbers.</p>
          <div className="form-group"><label>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required /></div>
          <div className="form-group"><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required /></div>
          <div className="form-group"><label>Confirm New Password</label><input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required /></div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={saving}>{saving ? "Updating..." : "Update Password"}</button>
        </form>
      )}

      {tab === "Orders" && (
        <div className="profile-form-card">
          <h2>Recent Orders</h2>
          {orders.length === 0 ? (
            <div style={{ padding: "2rem 0", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No orders yet.</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Shop Now</Link>
            </div>
          ) : (
            <div className="mini-orders">
              {orders.slice(0, 5).map(o => (
                <div key={o._id} className="mini-order">
                  <div><p className="mini-order-id">#{o._id.slice(-8).toUpperCase()}</p><p className="mini-order-date">{new Date(o.createdAt).toLocaleDateString()}</p></div>
                  <span className={`order-status status-${o.status}`}>{o.status}</span>
                  <span className="mini-order-total">NPR {o.total?.toLocaleString()}</span>
                </div>
              ))}
              <Link to="/orders" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", display: "inline-block" }}>View All Orders</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
