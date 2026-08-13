export default function InvoicePreview({ businessData, invoiceData }) {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * invoiceData.taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="doc-content">
      <div className="doc-header">
        <div className="doc-brand">
          <h1>{businessData.name || 'Business Name'}</h1>
          <p>{businessData.address}</p>
          {businessData.gstin && <p>GSTIN: {businessData.gstin}</p>}
          <p>{businessData.phone} | {businessData.email}</p>
        </div>
        <div className="doc-title">
          <h2>INVOICE</h2>
          <div className="doc-meta">
            <p><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
            <p><strong>Date:</strong> {invoiceData.date}</p>
          </div>
        </div>
      </div>

      <div className="doc-parties">
        <div className="party-box">
          <h4>Billed To:</h4>
          <p><strong>{invoiceData.clientName || 'Client Name'}</strong></p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{invoiceData.clientAddress}</p>
        </div>
      </div>

      <table className="doc-table">
        <thead>
          <tr>
            <th>Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={item.id || index}>
              <td>{item.description || 'Item Description'}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">₹{Number(item.price).toFixed(2)}</td>
              <td className="text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="doc-summary">
        <div className="summary-box">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax ({invoiceData.taxRate}%):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {invoiceData.notes && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Notes / Terms</h4>
          <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{invoiceData.notes}</p>
        </div>
      )}

      <div className="doc-footer">
        <p>This is a computer generated document. No signature is required.</p>
        <p style={{ marginTop: '0.5rem' }}><strong>{businessData.name}</strong></p>
      </div>
    </div>
  );
}
