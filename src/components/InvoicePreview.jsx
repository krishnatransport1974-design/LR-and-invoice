import React from 'react';

export default function InvoicePreview({ businessData, invoiceData }) {
  const formatToUse = invoiceData?.format || businessData?.default_invoice_format || 'standard';
  const isModern = formatToUse === 'modern';
  
  const primaryColor = isModern ? '#0f172a' : '#1e293b'; 
  const accentColor = isModern ? '#2563eb' : '#3b82f6';
  const borderColor = '#e2e8f0';

  // Calculate totals
  const subtotal = invoiceData?.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
  const tax_amount = subtotal * ((invoiceData?.taxRate || 0) / 100);
  const total = subtotal + tax_amount;

  return (
    <>
      <style>
        {`
          @media print {
            @page { size: a4 portrait; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          }
        `}
      </style>
      <div style={{
        width: '210mm',
        height: '297mm',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        padding: '20px 30px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        color: primaryColor,
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.9rem'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${accentColor}`, paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            {businessData?.logo_url ? (
              <img src={businessData.logo_url} alt="Logo" style={{ maxWidth: '200px', maxHeight: '80px', objectFit: 'contain', marginBottom: '10px' }} />
            ) : (
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 10px 0', color: primaryColor, textTransform: 'uppercase' }}>
                {businessData?.name || 'Company Name'}
              </h1>
            )}
            <div style={{ color: '#475569', lineHeight: '1.4' }}>
              <p style={{ margin: 0 }}>{businessData?.address}</p>
              <p style={{ margin: 0 }}><strong>Phone:</strong> {businessData?.phone || '-'}</p>
              <p style={{ margin: 0 }}><strong>Email:</strong> {businessData?.email || '-'}</p>
              <p style={{ margin: 0 }}><strong>GSTIN:</strong> {businessData?.gstin || '-'}</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0', color: accentColor, textTransform: 'uppercase', letterSpacing: '2px' }}>INVOICE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', width: '200px', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Invoice No:</span>
                <span style={{ fontWeight: '700' }}>{invoiceData?.invoiceNumber || '-'}</span>
              </div>
              <div style={{ display: 'flex', width: '200px', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>Date:</span>
                <span style={{ fontWeight: '700' }}>{invoiceData?.date ? invoiceData.date.split('-').reverse().join('/') : '-'}</span>
              </div>
              {invoiceData?.dueDate && (
                <div style={{ display: 'flex', width: '200px', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: '#64748b' }}>Due Date:</span>
                  <span style={{ fontWeight: '700' }}>{invoiceData.dueDate.split('-').reverse().join('/')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', margin: '0 0 8px 0' }}>Bill To</h3>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>{invoiceData?.clientName || '-'}</div>
            <div style={{ color: '#475569', whiteSpace: 'pre-wrap' }}>{invoiceData?.clientAddress || '-'}</div>
          </div>
          {invoiceData?.lr_id && (
            <div style={{ flex: 1, padding: '15px', borderRadius: '6px', border: `1px dashed ${accentColor}`, backgroundColor: '#eff6ff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: accentColor, fontWeight: '700', marginBottom: '4px' }}>GENERATED FROM LORRY RECEIPT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: primaryColor }}>Referenced LR Attached</div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
                <th style={{ padding: '10px 15px', borderRadius: '6px 0 0 0' }}>DESCRIPTION</th>
                <th style={{ padding: '10px 15px', textAlign: 'center' }}>QTY</th>
                <th style={{ padding: '10px 15px', textAlign: 'right' }}>RATE</th>
                <th style={{ padding: '10px 15px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData?.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '12px 15px' }}>{item.description}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'right' }}>₹{Number(item.price).toFixed(2)}</td>
                  <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '600' }}>₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderTop: `2px solid ${borderColor}`, paddingTop: '20px' }}>
          <div style={{ flex: 2 }}>
            <h4 style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>Notes / Terms</h4>
            <div style={{ color: '#475569', fontSize: '0.85rem', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
              {invoiceData?.notes || 'Thank you for your business!'}
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <div style={{ fontWeight: '700', color: primaryColor, fontSize: '0.9rem' }}>Bank Details:</div>
              <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                Please add bank details in settings.
              </div>
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#475569' }}>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#475569' }}>Tax ({invoiceData?.taxRate || 0}%):</span>
              <span style={{ fontWeight: '600' }}>₹{tax_amount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: `1px solid ${borderColor}` }}>
              <span style={{ fontWeight: '700', fontSize: '1.2rem', color: primaryColor }}>Total:</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem', color: accentColor }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            {businessData?.signature_url ? (
              <img src={businessData.signature_url} alt="Sign" style={{ height: '50px', objectFit: 'contain' }} />
            ) : (
              <div style={{ height: '50px' }}></div>
            )}
            <div style={{ borderTop: `2px solid ${primaryColor}`, paddingTop: '5px', width: '200px', fontWeight: '700', color: primaryColor }}>
              For {businessData?.name || 'Company'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
