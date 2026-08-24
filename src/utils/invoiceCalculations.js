export function calculateInvoiceTotals(items, globalDiscount = 0, taxRate = 0, includeTax = true) {
  // 1. Calculate Line Items
  let subtotal = 0;
  
  const processedItems = items.map(item => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    const itemDiscount = Number(item.discount) || 0;
    
    // Amount before item-level discount
    const grossAmount = qty * rate;
    // Amount after item-level discount
    const netAmount = grossAmount - itemDiscount;
    
    subtotal += netAmount;
    
    return {
      ...item,
      grossAmount,
      netAmount
    };
  });

  // 2. Global Discount
  const totalDiscount = Number(globalDiscount) || 0;
  
  // 3. Taxable Amount
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  
  // 4. Taxes
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let taxAmount = 0;

  if (includeTax) {
    const rate = Number(taxRate) || 0;
    taxAmount = taxableAmount * (rate / 100);
    // Assuming intra-state (CGST + SGST) for now, split equally
    cgst = taxAmount / 2;
    sgst = taxAmount / 2;
  }

  // 5. Totals
  const rawTotal = taxableAmount + taxAmount;
  const roundOff = Math.round(rawTotal) - rawTotal;
  const grandTotal = Math.round(rawTotal);

  return {
    processedItems,
    subtotal: subtotal,
    discount: totalDiscount,
    taxableAmount: taxableAmount,
    taxRate: taxRate,
    taxAmount: taxAmount,
    cgst: cgst,
    sgst: sgst,
    igst: igst,
    rawTotal: rawTotal,
    roundOff: roundOff,
    grandTotal: grandTotal
  };
}
