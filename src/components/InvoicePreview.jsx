import React, { useMemo } from 'react';
import { calculateInvoiceTotals } from '../utils/invoiceCalculations';
import { numberToWords } from '../utils/numberToWords';

const InvoicePreview = ({ businessData, invoiceData }) => {
  const formatToUse = invoiceData?.format || businessData?.default_invoice_format || 'standard';
  const isModern = formatToUse === 'modern';
  
  const primaryColor = isModern ? '#0f172a' : '#1e293b'; 
  const accentColor = isModern ? '#2563eb' : '#3b82f6';

  const {
    processedItems,
    subtotal,
    discount,
    taxableAmount,
    taxAmount,
    cgst,
    sgst,
    igst,
    roundOff,
    grandTotal
  } = useMemo(() => {
    // Determine global tax rate if items don't have individual tax rates
    return calculateInvoiceTotals(
      invoiceData?.items || [], 
      invoiceData?.global_discount || 0, 
      invoiceData?.taxRate || 0, 
      invoiceData?.includeTax !== false
    );
  }, [invoiceData]);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          #invoice-preview-content * {
            box-sizing: border-box;
          }
          
          .invoice-table th, .invoice-table td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
          }
          
          .invoice-table th {
            background-color: ${isModern ? '#f8fafc' : '#f1f5f9'};
            color: ${primaryColor};
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
          }
        `}
      </style>
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        color: primaryColor,
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.9rem'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${accentColor}`, paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            {businessData?.logo_url && (
              <div style={{ width: '120px', display: 'flex', alignItems: 'flex-start' }}>
                <img src={businessData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0', color: primaryColor, textTransform: 'uppercase', lineHeight: '1.2' }}>
                {businessData?.name || 'Company Name'}
              </h1>
              <div style={{ color: '#475569', lineHeight: '1.4', fontSize: '0.8rem' }}>
                {businessData?.address && <p style={{ margin: '0 0 2px 0' }}>{businessData.address}</p>}
                <p style={{ margin: 0 }}>
                  {businessData?.phone && <span><strong>Ph:</strong> {businessData.phone} </span>}
                  {businessData?.email && <span><strong>Email:</strong> {businessData.email}</span>}
                </p>
                {businessData?.gstin && <p style={{ margin: 0 }}><strong>GSTIN:</strong> {businessData.gstin}</p>}
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 10px 0', color: accentColor, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {invoiceData?.invoice_type?.toUpperCase() || 'TAX INVOICE'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end', fontSize: '0.85rem' }}>
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
              <div style={{ display: 'flex', width: '200px', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: '#64748b' }}>GSTIN:</span>
                <span style={{ fontWeight: '700' }}>{businessData?.gstin || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ width: '50%', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Bill To</h3>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '5px' }}>{invoiceData?.clientName || '-'}</div>
            <div style={{ color: '#475569', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {invoiceData?.clientAddress || 'Address details'}
            </div>
            
            <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '5px' }}>
              <span><strong>Ph:</strong> {invoiceData?.clientPhone || '__________'} </span>
            </div>
            <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '2px' }}>
              <span><strong>Email:</strong> {invoiceData?.clientEmail || '__________'}</span>
            </div>
            <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '3px' }}>
              <strong>GSTIN:</strong> {invoiceData?.clientGstin || '__________'}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th style={{ width: '5%', textAlign: 'center' }}>#</th>
              <th style={{ width: '35%', textAlign: 'left' }}>Item / Description</th>
              <th style={{ width: '10%', textAlign: 'center' }}>HSN/SAC</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Tax %</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item, index) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                <td style={{ fontWeight: '600' }}>{item.description || '-'}</td>
                <td style={{ textAlign: 'center' }}>{item.hsn_sac || '-'}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right' }}>{Number(item.price || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{invoiceData?.includeTax !== false ? `${item.tax_rate || invoiceData?.taxRate || 0}%` : '-'}</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.netAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Notes Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
          
          <div style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Amount in Words:</h4>
              <p style={{ margin: 0, fontWeight: '600', fontStyle: 'italic', color: '#334155' }}>
                {numberToWords(grandTotal)}
              </p>
            </div>
            
            {businessData?.show_bank_details !== false && (businessData?.bank_name || businessData?.account_number) && (
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Bank Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'x-4 y-1', lineHeight: '1.4' }}>
                  {businessData.bank_name && <><strong style={{ width: '100px' }}>Bank Name:</strong> <span>{businessData.bank_name}</span></>}
                  {businessData.account_name && <><strong>Account Name:</strong> <span>{businessData.account_name}</span></>}
                  {businessData.account_number && <><strong>Account No.:</strong> <span>{businessData.account_number}</span></>}
                  {businessData.ifsc && <><strong>IFSC Code:</strong> <span>{businessData.ifsc}</span></>}
                  {businessData.upi_id && <><strong>UPI ID:</strong> <span>{businessData.upi_id}</span></>}
                </div>
              </div>
            )}
            
            {(invoiceData?.terms || invoiceData?.notes) && (
              <div style={{ fontSize: '0.8rem' }}>
                {invoiceData?.notes && (
                  <div style={{ marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 2px 0' }}>Notes</h4>
                    <p style={{ margin: 0, color: '#475569', whiteSpace: 'pre-wrap' }}>{invoiceData.notes}</p>
                  </div>
                )}
                {invoiceData?.terms && (
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 2px 0' }}>Terms & Conditions</h4>
                    <p style={{ margin: 0, color: '#475569', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{invoiceData.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ width: '40%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 12px', fontWeight: '600', color: '#475569' }}>Subtotal</td>
                  <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '600' }}>₹{subtotal.toFixed(2)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', fontWeight: '600', color: '#ef4444' }}>Discount</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>- ₹{discount.toFixed(2)}</td>
                  </tr>
                )}
                
                {invoiceData?.includeTax !== false && taxAmount > 0 && (
                  <>
                    <tr>
                      <td style={{ padding: '6px 12px', fontWeight: '600', color: '#475569' }}>Taxable Amount</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '600' }}>₹{taxableAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px', color: '#64748b' }}>CGST</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>₹{cgst.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px', color: '#64748b' }}>SGST</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>₹{sgst.toFixed(2)}</td>
                    </tr>
                  </>
                )}
                
                {roundOff !== 0 && (
                  <tr>
                    <td style={{ padding: '6px 12px', color: '#64748b' }}>Round Off</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</td>
                  </tr>
                )}
                
                <tr style={{ backgroundColor: isModern ? '#f1f5f9' : '#f8fafc', borderTop: `2px solid ${accentColor}`, borderBottom: `2px solid ${accentColor}` }}>
                  <td style={{ padding: '12px', fontWeight: '800', fontSize: '1.1rem', color: primaryColor }}>GRAND TOTAL</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem', color: primaryColor }}>₹{grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>

        {/* Signature Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            {businessData?.signature_url ? (
              <img src={businessData.signature_url} alt="Signature" style={{ maxHeight: '60px', objectFit: 'contain', marginBottom: '5px' }} />
            ) : (
              <div style={{ height: '60px' }}></div>
            )}
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '5px', fontWeight: '700', fontSize: '0.8rem', color: primaryColor }}>
              For {businessData?.name || 'Company Name'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Authorized Signatory</div>
          </div>
        </div>

      </div>
    </>
  );
};

export default InvoicePreview;
