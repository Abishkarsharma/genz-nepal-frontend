import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

function OrderTracker({ status }) {
  if (status === "cancelled") {
    return (
      <div className="tracker-cancelled"><span>x</span> Order Cancelled</div>
    );
  }
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STATUS_STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`tracker-node ${i <= idx ? "done" : ""} ${i === idx ? "active" : ""}`}>
            <div className="tracker-circle">{i < idx ? "v" : i + 1}</div>
            <span className="tracker-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`tracker-line ${i < idx ? "filled" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Orders() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/api/orders/my", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="spinner" style={{ marginTop: "4rem" }} />;

  return (
    <div className="orders-wrap">
      <div className="container orders-page">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <span className="orders-count">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you shop.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const addr = order.shippingAddress || {};
              const isOpen = expanded === order._id;
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-top" onClick={() => setExpanded(isOpen ? null : order._id)}>
                    <div className="order-meta">
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="order-card-right">
                      <span className={`order-status-badge status-${order.status}`}>{order.status}</span>
                      <span className="order-total-badge">NPR {order.total?.toLocaleString()}</span>
                      <span className={`expand-icon ${isOpen ? "open" : ""}`}>v</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} className="order-thumb" />
                    ))}
                    {order.items.length > 4 && <span className="order-more-items">+{order.items.length - 4}</span>}
                    <span className="order-item-count">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                  </div>

                  <OrderTracker status={order.status} />

                  {isOpen && (
                    <div className="order-details">
                      <div className="order-detail-section">
                        <h4>Items Ordered</h4>
                        {order.items.map((item, i) => (
                          <div key={i} className="order-detail-item">
                            <img src={item.image} alt={item.name} />
                            <div className="order-detail-item-info">
                              <p className="order-detail-item-name">{item.name}</p>
                              <p className="order-detail-item-meta">Qty: {item.quantity} x NPR {item.price?.toLocaleString()}</p>
                            </div>
                            <span className="order-detail-item-total">NPR {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-detail-section">
                        <h4>Delivery Address</h4>
                        <div className="address-block">
                          <p className="addr-name">{addr.fullName}</p>
                          <p className="addr-line">{addr.phone}{addr.email ? ` - ${addr.email}` : ""}</p>
                          <p className="addr-line">{[addr.street, addr.area, addr.landmark].filter(Boolean).join(", ")}</p>
                          <p className="addr-line">
                            {[addr.city, addr.district, addr.province].filter(Boolean).join(", ")}
                            {addr.postalCode ? ` - ${addr.postalCode}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="order-detail-section">
                        <h4>Payment</h4>
                        <div className="order-payment-row">
                          <span>{order.paymentMethod}</span>
                          <span className={`payment-status-pill ${order.paymentStatus === "paid" ? "paid" : "pending-pay"}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="order-totals">
                          <div className="order-total-row"><span>Subtotal</span><span>NPR {order.subtotal?.toLocaleString()}</span></div>
                          <div className="order-total-row"><span>Shipping</span><span>NPR {order.shipping?.toLocaleString()}</span></div>
                          <div className="order-total-row grand"><span>Total</span><span>NPR {order.total?.toLocaleString()}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
