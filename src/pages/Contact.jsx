import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, wire this to an email service like EmailJS or your backend
    setSent(true);
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <p className="contact-tag">Get In Touch</p>
          <h1>We'd Love to Hear From You</h1>
          <p>Have a question, feedback, or want to become a seller? We're here for you.</p>
        </div>
      </section>

      <div className="container contact-layout">

        {/* Info Cards */}
        <div className="contact-info">
          <div className="contact-card">
            <span>📍</span>
            <div>
              <h4>Our Location</h4>
              <p>Thamel, Kathmandu<br />Nepal 44600</p>
            </div>
          </div>
          <div className="contact-card">
            <span>📧</span>
            <div>
              <h4>Email Us</h4>
              <p>support@genznepal.com<br />sellers@genznepal.com</p>
            </div>
          </div>
          <div className="contact-card">
            <span>📞</span>
            <div>
              <h4>Call Us</h4>
              <p>+977 98XXXXXXXX<br />Mon–Sat, 9am–6pm</p>
            </div>
          </div>
          <div className="contact-card">
            <span>⏰</span>
            <div>
              <h4>Support Hours</h4>
              <p>Monday – Saturday<br />9:00 AM – 6:00 PM NPT</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrap">
          {sent ? (
            <div className="contact-success">
              <span>✅</span>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => setSent(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h2>Send a Message</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Aabiskar Sapkota" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="you@example.com" required />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required>
                  <option value="">Select a topic</option>
                  <option>Order Issue</option>
                  <option>Product Question</option>
                  <option>Become a Seller</option>
                  <option>Return / Refund</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Tell us how we can help..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
