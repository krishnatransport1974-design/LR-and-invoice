import React from 'react';

const SingleLR = ({ businessData, lrData, copyType, bgColor }) => {
  return (
    <div style={{
      backgroundColor: bgColor || 'white',
      padding: '20px',
      position: 'relative',
      height: '210mm', // Strict Landscape height
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: 'black',
      fontFamily: '"Arial", sans-serif',
      fontSize: '0.85rem',
      overflow: 'hidden' // Prevent any internal expansion from ruining PDF pagination
    }} className="single-lr-page">
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        {/* Logo */}
        <div style={{ width: '220px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {businessData?.logo_url ? (
            <img src={businessData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ border: '1px solid black', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>LOGO</span>
            </div>
          )}
        </div>

        {/* Center Details */}
        <div style={{ flex: 1, textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', fontFamily: '"Times New Roman", serif', letterSpacing: '1px' }}>
            {businessData?.name || 'Company Name'}
          </h1>
          <div style={{ fontWeight: '600', fontSize: '0.85rem', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '3px' }}>
              {businessData?.address ? businessData.address.replace(/\n/g, ', ') : ''}
            </div>
            <div>
              {businessData?.phone && <span>Contact No.: {businessData.phone}</span>}
              {businessData?.phone && businessData?.email && <span style={{ margin: '0 8px', color: '#666' }}>|</span>}
              {businessData?.email && <span>Email: {businessData.email}</span>}
              {(businessData?.phone || businessData?.email) && businessData?.gstin && <span style={{ margin: '0 8px', color: '#666' }}>|</span>}
              {businessData?.gstin && <span>GSTIN: {businessData.gstin}</span>}
            </div>
          </div>
        </div>

        {/* Right Bilty Box */}
        <div style={{ width: '220px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>
            SUBJECT TO {businessData?.jurisdiction_city || 'MUMBAI'} JURISDICTION
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', textAlign: 'center', marginTop: '5px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>Bilty No.</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '4px', fontSize: '1.4rem', fontWeight: 'bold' }}>{lrData?.lrNumber || '-'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '4px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span>Date</span>
                  <span style={{ fontWeight: 'bold' }}>{lrData?.date ? lrData.date.split('-').reverse().join('/') : '-'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* From / To Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.1rem' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
          <span>From</span>
          <div style={{ borderBottom: '1px solid black', flex: 1, margin: '0 20px', fontWeight: 'bold', paddingLeft: '10px' }}>
            {lrData?.from || ''}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
          <span>To</span>
          <div style={{ borderBottom: '1px solid black', flex: 1, margin: '0 0 0 20px', fontWeight: 'bold', paddingLeft: '10px' }}>
            {lrData?.to || ''}
          </div>
        </div>
      </div>

      {/* Consignor */}
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '6px', fontSize: '0.95rem' }}>
        <span style={{ color: '#ef4444', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Consignor M/s.</span>
        <div style={{ borderBottom: '1px solid black', flex: 1, margin: '0 0 0 10px', fontWeight: 'bold', paddingLeft: '5px' }}>
          {lrData?.consignorName || ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px', fontSize: '0.95rem' }}>
        <span style={{ color: '#ef4444', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Address</span>
        <div style={{ borderBottom: '1px solid black', flex: 1, margin: '0 0 0 10px', paddingLeft: '5px' }}>
          {lrData?.consignorAddress || ''}
        </div>
      </div>

      {/* Consignee */}
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '6px', fontSize: '0.95rem' }}>
        <span style={{ color: '#ef4444', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Consignee M/s.</span>
        <div style={{ borderBottom: '1px solid black', flex: 1, margin: '0 0 0 10px', fontWeight: 'bold', paddingLeft: '5px' }}>
          {lrData?.consigneeName || ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px', fontSize: '0.95rem' }}>
        <span style={{ color: '#ef4444', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Address</span>
        <div style={{ borderBottom: '1px solid black', flex: 1, margin: '0 0 0 10px', paddingLeft: '5px' }}>
          {lrData?.consigneeAddress || ''}
        </div>
      </div>

      {/* Inv No */}
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px', fontSize: '0.95rem' }}>
        <span style={{ color: '#ef4444', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Inv. No. -</span>
        <div style={{ borderBottom: '1px solid black', flex: 1, maxWidth: '400px', margin: '0 0 0 10px', fontWeight: 'bold', color: '#2563eb', paddingLeft: '5px' }}>
          {lrData?.invNo || ''}
        </div>
      </div>

      {/* Goods Table */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', textAlign: 'center', height: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '10px 8px', width: '15%' }}>No. of<br/>Packages</th>
              <th style={{ border: '1px solid black', padding: '10px 8px', width: '30%' }}>Description</th>
              <th style={{ border: '1px solid black', padding: '10px 8px', width: '15%' }}>Tank/Lorry No.</th>
              <th style={{ border: '1px solid black', padding: '10px 8px', width: '15%' }}>Product</th>
              <th style={{ border: '1px solid black', padding: '10px 8px', width: '10%' }}>Weight</th>
              <th style={{ border: '1px solid black', padding: '10px 8px', width: '15%' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {lrData?.goods?.map((good, idx) => (
              <tr key={idx}>
                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{good.packages}</td>
                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{good.description}</td>
                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', verticalAlign: 'top' }}>{good.lorryNo}</td>
                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', verticalAlign: 'top' }}>{good.product}</td>
                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', verticalAlign: 'top' }}>{good.weight}</td>
                <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '8px', verticalAlign: 'top', borderBottom: idx === 0 && good.remarks ? '1px solid black' : 'none' }}>
                  {good.remarks}
                </td>
              </tr>
            ))}
            {/* Fill empty space row so borders go all the way down */}
            <tr style={{ height: '100%' }}>
              <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black', padding: '0' }}></td>
              <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}></td>
              <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}></td>
              <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}></td>
              <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}></td>
              <td style={{ borderLeft: '1px solid black', borderRight: '1px solid black' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms & Conditions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginTop: '4px', lineHeight: '1.2' }}>
        <div style={{ width: '45%' }}>
          In case of any shortage or difference in material kindly endorse on receipt no shortage will be entertained in absence of any such endorsement in challan with driver's signature. No responsibility for leakage or damage in natural calamity. Kindly receive the above material in good condition &amp; correct measure.
        </div>
        <div style={{ width: '45%', textAlign: 'right' }}>
          We have not availed convect credit on inputs or capital goods used to provide transport service. we have also not availed the benefit under notification 12/2003 dated 20/6/2003.
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', paddingBottom: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', borderTop: '1px solid black', margin: '0 auto', paddingTop: '5px', fontWeight: 'bold' }}>
            Driver's Signature
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', borderTop: '1px solid black', margin: '0 auto', paddingTop: '5px', fontWeight: 'bold' }}>
            Receiver's Signature
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px', display: 'flex', alignItems: 'end', justifyContent: 'center', marginBottom: '5px' }}>
             {businessData?.signature_url && (
               <img src={businessData.signature_url} alt="Sign" style={{ height: '40px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
             )}
          </div>
          <div style={{ width: '200px', borderTop: '1px solid black', margin: '0 auto', paddingTop: '5px', fontWeight: 'bold' }}>
            For {businessData?.name || 'Company'}
          </div>
        </div>
      </div>

      {/* Copy Type Tag */}
      {copyType && (
        <div className="no-print" style={{ 
          position: 'absolute', top: '15px', left: '15px', 
          fontSize: '0.65rem', fontWeight: 'bold', 
          textTransform: 'uppercase', color: 'white',
          backgroundColor: '#ef4444',
          padding: '4px 8px', borderRadius: '4px'
        }}>
          {copyType}
        </div>
      )}

    </div>
  );
};

export default function LRPreview({ businessData, lrData, printMode = 'main' }) {
  return (
    <>
      <style>
        {`
          @media print {
            @page { size: a4 landscape; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          }
        `}
      </style>
      <div style={{ width: '297mm', backgroundColor: 'white' }}>
        <SingleLR businessData={businessData} lrData={lrData} copyType="Main Copy" bgColor="#ffffff" />
        {/* If user wants to print both copies, they could be mapped here. Keeping it single for PDF standard A4. */}
      </div>
    </>
  );
}
