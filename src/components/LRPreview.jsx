import React from 'react';

const SingleLR = ({ businessData, lrData, copyType, bgColor }) => {
  const formatToUse = lrData?.format || businessData?.default_lr_format || 'standard';
  const isCompact = formatToUse === 'compact';
  const isModern = formatToUse === 'modern';
  
  const primaryColor = isModern ? '#0f172a' : '#1e293b'; 
  const accentColor = isModern ? '#2563eb' : '#3b82f6';
  const borderColor = '#e2e8f0';

  return (
    <div style={{
      backgroundColor: bgColor,
      padding: isCompact ? '15px' : '20px 30px',
      position: 'relative',
      minHeight: isCompact ? '148mm' : '210mm', // Landscape height
      width: '100%', // Take up full width of the wrapper (297mm)
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: primaryColor,
      fontFamily: '"Inter", sans-serif',
      fontSize: isCompact ? '0.8rem' : '0.9rem'
    }} className="single-lr-page">
      
      {/* Copy Type Tag */}
      <div className="no-print" style={{ 
        position: 'absolute', top: '10px', left: '10px', 
        fontSize: '0.65rem', fontWeight: 'bold', 
        textTransform: 'uppercase', color: 'white',
        backgroundColor: accentColor,
        padding: '4px 8px', borderRadius: '4px'
      }}>
        {copyType}
      </div>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: `2px solid ${accentColor}`, paddingBottom: '10px' }}>
        
        {/* Logo */}
        <div style={{ width: '150px', display: 'flex', alignItems: 'center' }}>
          {businessData?.logo_url ? (
            <img src={businessData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: accentColor }}>LOGO</div>
          )}
        </div>

        {/* Business Details */}
        <div style={{ flex: 1, textAlign: 'center', padding: '0 15px' }}>
          <h1 style={{ fontSize: isCompact ? '1.5rem' : '2rem', fontWeight: '800', margin: '0 0 4px 0', color: primaryColor, textTransform: 'uppercase' }}>
            {businessData?.name || 'Company Name'}
          </h1>
          <p style={{ margin: '0 0 4px 0', color: '#475569', fontWeight: '500' }}>
            {businessData?.address}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
            <span style={{ fontWeight: '600' }}>GSTIN:</span> {businessData?.gstin || '-'} &nbsp; | &nbsp; 
            <span style={{ fontWeight: '600' }}>Phone:</span> {businessData?.phone || '-'}
          </div>
        </div>

        {/* LR Box */}
        <div style={{ width: '180px', textAlign: 'right' }}>
          <div style={{ border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '10px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>LORRY RECEIPT NO.</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: accentColor, margin: '4px 0' }}>{lrData?.lrNumber || '-'}</div>
            <div style={{ borderTop: `1px solid ${borderColor}`, margin: '6px -10px' }}></div>
            <div style={{ fontSize: '0.85rem' }}><strong>Date:</strong> {lrData?.date ? lrData.date.split('-').reverse().join('/') : '-'}</div>
          </div>
        </div>
      </div>

      {/* From / To & Invoice Info */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 2, display: 'flex', border: `1px solid ${borderColor}`, borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRight: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center' }}>
            <strong>From:</strong> &nbsp; {lrData?.from || '-'}
          </div>
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
            <strong>To:</strong> &nbsp; {lrData?.to || '-'}
          </div>
        </div>
        <div style={{ flex: 1, padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', backgroundColor: '#eff6ff' }}>
          <strong>Inv. No:</strong> {lrData?.invNo || '-'}
        </div>
      </div>

      {/* Parties */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 1, border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>CONSIGNOR (SENDER)</div>
          <div style={{ fontWeight: '700' }}>{lrData?.consignorName || '-'}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{lrData?.consignorAddress || '-'}</div>
        </div>
        <div style={{ flex: 1, border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>CONSIGNEE (RECEIVER)</div>
          <div style={{ fontWeight: '700' }}>{lrData?.consigneeName || '-'}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{lrData?.consigneeAddress || '-'}</div>
        </div>
      </div>

      {/* Goods Table */}
      <div style={{ flex: 1, border: `1px solid ${borderColor}`, borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: `2px solid ${borderColor}` }}>
              <th style={{ padding: '8px 10px', width: '15%' }}>PACKAGES</th>
              <th style={{ padding: '8px 10px', width: '30%' }}>DESCRIPTION</th>
              <th style={{ padding: '8px 10px', width: '20%' }}>LORRY NO.</th>
              <th style={{ padding: '8px 10px', width: '20%' }}>PRODUCT</th>
              <th style={{ padding: '8px 10px', width: '15%' }}>WEIGHT</th>
            </tr>
          </thead>
          <tbody>
            {lrData?.goods?.map((good, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${borderColor}` }}>
                <td style={{ padding: '8px 10px', whiteSpace: 'pre-wrap' }}>{good.packages}</td>
                <td style={{ padding: '8px 10px', whiteSpace: 'pre-wrap' }}>
                  {good.description}
                  {good.remarks && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Ref: {good.remarks}</div>}
                </td>
                <td style={{ padding: '8px 10px' }}>{good.lorryNo}</td>
                <td style={{ padding: '8px 10px' }}>{good.product}</td>
                <td style={{ padding: '8px 10px', fontWeight: '600' }}>{good.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Signatures */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '50px' }}></div>
          <div style={{ borderTop: '1px solid black', paddingTop: '5px', width: '150px' }}>Driver's Sign</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '50px' }}></div>
          <div style={{ borderTop: '1px solid black', paddingTop: '5px', width: '150px' }}>Receiver's Sign</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {businessData?.signature_url ? (
            <img src={businessData.signature_url} alt="Sign" style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            <div style={{ height: '40px' }}></div>
          )}
          <div style={{ borderTop: '1px solid black', paddingTop: '5px', width: '200px', fontWeight: '700', color: accentColor }}>
            For {businessData?.name || 'Company'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LRPreview({ businessData, lrData, printMode = 'main' }) {
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
      <div style={{ width: '210mm', backgroundColor: 'white' }}>
        <SingleLR businessData={businessData} lrData={lrData} copyType="Main Copy" bgColor="#ffffff" />
        {/* If user wants to print both copies, they could be mapped here. Keeping it single for PDF standard A4. */}
      </div>
    </>
  );
}
