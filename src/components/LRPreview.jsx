const SingleLR = ({ businessData, lrData, copyType, bgColor }) => {
  // Using a modern, clean slate/navy color palette for a premium look
  const primaryColor = '#1e293b'; // Slate 800
  const accentColor = '#3b82f6'; // Blue 500
  const lightGray = '#f8fafc'; // Slate 50
  const borderColor = '#e2e8f0'; // Slate 200

  return (
    <div style={{
      backgroundColor: bgColor,
      padding: '30px 40px',
      position: 'relative',
      minHeight: '792px', /* A4 landscape height */
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: primaryColor,
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
    }} className="single-lr-page">
      
      {/* Copy Type Tag */}
      <div className="no-print" style={{ 
        position: 'absolute', top: '20px', left: '20px', 
        fontSize: '0.75rem', fontWeight: 'bold', 
        textTransform: 'uppercase', color: 'white',
        backgroundColor: accentColor,
        padding: '4px 10px', borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {copyType}
      </div>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        
        {/* Left: Prominent Logo */}
        <div style={{ width: '250px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          {businessData.logo ? (
            <img src={businessData.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '100%', height: '100px', backgroundColor: lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#94a3b8', fontStyle: 'italic' }}>
              Upload Logo
            </div>
          )}
        </div>

        {/* Center: Business Details (Larger, more visible) */}
        <div style={{ flex: 1, textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            margin: '0 0 8px 0', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: primaryColor
          }}>
            {businessData.name || 'KRISHNA TRANSPORT'}
          </h1>
          <p style={{ fontSize: '0.9rem', margin: '0 0 4px 0', color: '#475569', fontWeight: '500' }}>
            {businessData.address}
          </p>
          <div style={{ display: 'inline-block', backgroundColor: lightGray, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', fontWeight: '500', marginTop: '4px' }}>
            <span style={{ color: accentColor }}>Tel:</span> {businessData.phone} &nbsp; | &nbsp; <span style={{ color: accentColor }}>Email:</span> {businessData.email}
          </div>
        </div>

        {/* Right: Modern Bilty Box */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '10px', color: '#64748b', letterSpacing: '0.5px' }}>
            SUBJECT TO {businessData.city ? businessData.city.toUpperCase() : 'MUMBAI'} JURISDICTION
          </div>
          <div style={{ 
            backgroundColor: lightGray, 
            border: `1px solid ${borderColor}`, 
            borderRadius: '8px',
            padding: '15px', 
            textAlign: 'center', 
            width: '100%', 
            boxSizing: 'border-box',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Lorry Receipt No.</span><br/>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: accentColor }}>
                {lrData.lrNumber}
              </span>
            </div>
            <div style={{ borderTop: `1px solid ${borderColor}`, margin: '0 -15px', marginBottom: '10px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Date</span>
              <span style={{ fontWeight: '700', fontSize: '1rem', color: primaryColor }}>{lrData.date.split('-').reverse().join('/')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* From / To & Invoice Info */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, backgroundColor: lightGray, borderRadius: '8px', padding: '12px 20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontWeight: '600', marginRight: '10px', fontSize: '0.9rem' }}>From:</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', flex: 1 }}>{lrData.from}</span>
          <span style={{ color: '#cbd5e1', margin: '0 15px' }}>|</span>
          <span style={{ color: '#64748b', fontWeight: '600', marginRight: '10px', fontSize: '0.9rem' }}>To:</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', flex: 1 }}>{lrData.to}</span>
        </div>
        <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '12px 20px', display: 'flex', alignItems: 'center', border: '1px solid #bfdbfe' }}>
          <span style={{ color: accentColor, fontWeight: '700', marginRight: '10px', fontSize: '0.9rem' }}>Inv. No:</span>
          <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e3a8a' }}>{lrData.invNo}</span>
        </div>
      </div>

      {/* Consignor / Consignee Modern Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
        {/* Consignor */}
        <div style={{ flex: 1, backgroundColor: 'white', border: `1px solid ${borderColor}`, borderLeft: `4px solid ${accentColor}`, borderRadius: '8px', padding: '15px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '5px' }}>Consignor (Sender)</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '5px', color: primaryColor }}>{lrData.consignorName || '-'}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{lrData.consignorAddress || '-'}</div>
        </div>

        {/* Consignee */}
        <div style={{ flex: 1, backgroundColor: 'white', border: `1px solid ${borderColor}`, borderLeft: `4px solid #10b981`, borderRadius: '8px', padding: '15px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '5px' }}>Consignee (Receiver)</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '5px', color: primaryColor }}>{lrData.consigneeName || '-'}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{lrData.consigneeAddress || '-'}</div>
        </div>
      </div>

      {/* Modern Table */}
      <div style={{ borderRadius: '8px', border: `1px solid ${borderColor}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: lightGray, borderBottom: `2px solid ${borderColor}` }}>
              <th style={{ padding: '12px 15px', width: '15%', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textAlign: 'left' }}>PACKAGES</th>
              <th style={{ padding: '12px 15px', width: '25%', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textAlign: 'left' }}>DESCRIPTION</th>
              <th style={{ padding: '12px 15px', width: '15%', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textAlign: 'center' }}>LORRY NO.</th>
              <th style={{ padding: '12px 15px', width: '15%', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textAlign: 'center' }}>PRODUCT</th>
              <th style={{ padding: '12px 15px', width: '15%', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textAlign: 'center' }}>WEIGHT</th>
              <th style={{ padding: '12px 15px', width: '15%', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textAlign: 'left' }}>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {lrData.goods && lrData.goods.map((good, index) => (
              <tr key={good.id || index} style={{ borderBottom: `1px solid ${borderColor}` }}>
                <td style={{ padding: '15px', fontSize: '0.9rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{good.packages}</td>
                <td style={{ padding: '15px', fontSize: '0.9rem', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{good.description}</td>
                <td style={{ padding: '15px', fontSize: '0.9rem', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'pre-wrap' }}>{good.lorryNo}</td>
                <td style={{ padding: '15px', fontSize: '0.9rem', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'pre-wrap' }}>{good.product}</td>
                <td style={{ padding: '15px', fontSize: '0.9rem', verticalAlign: 'top', textAlign: 'center', fontWeight: '600', whiteSpace: 'pre-wrap' }}>{good.weight}</td>
                <td style={{ padding: '15px', fontSize: '0.9rem', verticalAlign: 'top', color: '#64748b', whiteSpace: 'pre-wrap' }}>{good.remarks}</td>
              </tr>
            ))}
            {/* Fill remaining space to keep layout structure */}
            <tr className="filler-row">
              <td colSpan="6"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer / Disclaimers / Signatures */}
      <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Disclaimers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', lineHeight: '1.4', marginBottom: '30px', padding: '15px', backgroundColor: lightGray, borderRadius: '8px' }}>
          <div style={{ width: '48%' }}>
            <strong>Note:</strong> In case of any shortage or difference in material kindly endorse on receipt. No shortage will be entertained in absence of any such endorsement in challan with driver's signature. No responsibility for leakage or damage in natural calamity. Kindly receive the above material in good condition & correct measure.
          </div>
          <div style={{ width: '48%', textAlign: 'right' }}>
            We have not availed convect credit on inputs or capital goods used to provide transport service. We have also not availed the benefit under notification 12/2003 dated 20/6/2003.
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px', marginTop: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }}></div> {/* Empty space for signing */}
            <div style={{ width: '180px', borderTop: `2px solid ${primaryColor}`, paddingTop: '8px', fontWeight: '700', fontSize: '0.85rem' }}>Driver's Signature</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }}></div> {/* Empty space for signing */}
            <div style={{ width: '180px', borderTop: `2px solid ${primaryColor}`, paddingTop: '8px', fontWeight: '700', fontSize: '0.85rem' }}>Receiver's Signature</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '50px' }}></div> {/* Empty space for signing */}
            <div style={{ width: '220px', borderTop: `2px solid ${accentColor}`, paddingTop: '8px', fontWeight: '800', fontSize: '0.85rem', color: accentColor }}>
              For {businessData.name ? businessData.name.toUpperCase() : 'TRANSPORT CO.'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function LRPreview({ businessData, lrData, printMode = 'both' }) {
  return (
    <>
      <style>
        {`
          @media screen {
            .filler-row {
              height: 100%;
            }
          }
          @media print {
            @page { size: landscape; margin: 0; }
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              margin: 0;
            }
            .filler-row {
              display: none !important;
            }
            .single-lr-page {
              height: 100vh !important;
              min-height: 100vh !important;
              border-bottom: none !important;
            }
            .page-break {
              page-break-before: always;
              break-before: page;
            }
          }
        `}
      </style>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {(printMode === 'both' || printMode === 'main') && (
          <SingleLR 
            businessData={businessData} 
            lrData={lrData} 
            copyType="Main Copy" 
            bgColor="#ffffff" 
          />
        )}
        
        {(printMode === 'both' || printMode === 'driver') && (
          <div className={printMode === 'both' ? "page-break" : ""}>
            <SingleLR 
              businessData={businessData} 
              lrData={lrData} 
              copyType="Driver Copy" 
              bgColor="#fffbeb" /* Elegant soft yellow */
            />
          </div>
        )}
      </div>
    </>
  );
}
