import { Link } from 'react-router-dom';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="container about-hero-content">
          <p className="about-tag">Our Story</p>
          <h1>Born in Kathmandu.<br />Built for the World.</h1>
          <p>The Gen.Z Nepal is a curated marketplace celebrating the craftsmanship, culture, and creativity of Nepal — brought to you by a generation that refuses to let tradition fade.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="container about-section">
        <div className="about-grid">
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>We believe Nepali artisans, makers, and entrepreneurs deserve a modern platform to reach customers who care. Every product on The Gen.Z Nepal is handpicked for quality, authenticity, and story.</p>
            <p>From singing bowls crafted in Bhaktapur to leather goods stitched in Patan — we connect you directly with the people who make them.</p>
          </div>
          <div className="about-stat-grid">
            <div className="about-stat"><span>500+</span><p>Products Listed</p></div>
            <div className="about-stat"><span>100+</span><p>Local Sellers</p></div>
            <div className="about-stat"><span>50+</span><p>Cities Delivered</p></div>
            <div className="about-stat"><span>10K+</span><p>Happy Customers</p></div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>What We Stand For</h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🏔️</span>
              <h3>Authenticity</h3>
              <p>Every product is verified and sourced directly from Nepali makers. No middlemen, no fakes.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">🤝</span>
              <h3>Community</h3>
              <p>We empower local sellers with tools to grow their business and reach customers nationwide.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">♻️</span>
              <h3>Sustainability</h3>
              <p>We prioritize eco-friendly packaging and support sellers who use sustainable materials.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">⚡</span>
              <h3>Gen.Z Energy</h3>
              <p>Modern design, fast delivery, and a seamless experience — because you deserve better.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container about-cta">
        <h2>Ready to explore?</h2>
        <p>Discover hundreds of authentic Nepali products, from everyday essentials to unique gifts.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Shop Now →</Link>
          <Link to="/contact" className="btn btn-outline">Contact Us</Link>
        </div>
      </section>

    </div>
  );
}
