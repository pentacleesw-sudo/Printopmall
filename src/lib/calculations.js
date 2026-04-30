export const calculateSpineThickness = (innerSections) => {
  let thickness = 0;
  innerSections.forEach(section => {
    let paperThickness = 0.05; // Default for 80g
    if (section.weight === '70g') paperThickness = 0.045;
    else if (section.weight === '80g') paperThickness = 0.05;
    else if (section.weight === '100g') paperThickness = 0.06;
    else if (section.weight === '120g') paperThickness = 0.075;
    else if (section.weight === '150g') paperThickness = 0.09;
    
    thickness += section.pages * paperThickness;
  });
  return Math.max(0, parseFloat(thickness.toFixed(2)));
};

export const calculatePriceBreakdown = (form, priceConfig) => {
  const qty = form.quantity;
  const range = priceConfig.ranges.find(r => qty >= r.min && (r.max === null || qty <= r.max)) || priceConfig.ranges[0];
  const rangeConfig = priceConfig.pricesByRange[range.id];

  // Determine which price to use
  const inputCode = (form.companyInfo?.code || '').trim().toLowerCase();
  const separateCompany = priceConfig.separateCompanies.find(c => 
    (c.code || '').trim().toLowerCase() === inputCode
  );
  
  const codePrefix = inputCode.charAt(0);
  let useSpecial = codePrefix === '2' || codePrefix === '3';
  let useSeparate = !!separateCompany;

  if (separateCompany?.priceMode) {
    useSeparate = separateCompany.priceMode === 'separate';
    useSpecial = separateCompany.priceMode === 'special';
  }

  const getExtraCharge = (charge) => {
    if (useSeparate && separateCompany && charge.separate[separateCompany.id] !== undefined) {
      return charge.separate[separateCompany.id];
    }
    return useSpecial ? charge.special : charge.general;
  };

  // 1. Inner sections price
  let innerBase = 0;
  form.innerSections.forEach(section => {
    const sizePrices = rangeConfig.innerPrices[form.size] || rangeConfig.innerPrices['신국판'];
    const prices = sizePrices[section.printing] || sizePrices['1도'];
    let pricePerPage = prices.general;
    if (useSeparate && separateCompany && prices.separate[separateCompany.id] !== undefined) {
      pricePerPage = prices.separate[separateCompany.id];
    } else if (useSpecial) {
      pricePerPage = prices.special;
    }
    innerBase += pricePerPage * section.pages;
  });
  const innerTotal = innerBase * qty;
  const discountRate = (priceConfig.globalDiscountRate || 5) / 100;
  const innerDiscount = form.applyDiscount ? Math.round(innerTotal * discountRate) : 0;
  const innerFinal = innerTotal - innerDiscount;

  // 2. Cover price
  const getCoverUnitPrice = (paper, weight) => {
    let unitPrice = rangeConfig.standardCoverPrice.general;
    if (useSeparate && separateCompany && rangeConfig.standardCoverPrice.separate[separateCompany.id] !== undefined) {
      unitPrice = rangeConfig.standardCoverPrice.separate[separateCompany.id];
    } else if (useSpecial) {
      unitPrice = rangeConfig.standardCoverPrice.special;
    }
    const isStandard = (paper === '스노우' || paper === '아트') && weight === '250';
    if (!isStandard) {
      unitPrice += 30;
    }
    return unitPrice;
  };

  const coverUnitPrice = getCoverUnitPrice(form.cover.paper, form.cover.weight);
  const coverTotal = coverUnitPrice * qty;
  const coverDiscount = form.applyDiscount ? Math.round(coverTotal * discountRate) : 0;
  const coverFinal = coverTotal - coverDiscount;

  // 3. Extra charges
  let extras = [];
  
  if (form.cover.printing === '양면 4도') {
    extras.push({ name: '표지 양면인쇄', cost: getExtraCharge(rangeConfig.extraCharges.doubleSidedPrinting) * qty });
  }
  if (form.cover.hasFlaps) {
    extras.push({ name: '표지 날개', cost: getExtraCharge(rangeConfig.extraCharges.flaps) * qty });
  }

  // Belly Band and Jacket
  if (form.bellyBand?.enabled) {
    const bellyBandUnitPrice = getCoverUnitPrice(form.bellyBand.paper, form.bellyBand.weight);
    let bellyBandCost = bellyBandUnitPrice * qty;
    if (form.bellyBand.printing === '양면 4도') {
      bellyBandCost += getExtraCharge(rangeConfig.extraCharges.doubleSidedPrinting) * qty;
    }
    extras.push({ name: '띠지', cost: bellyBandCost });
  }

  if (form.jacket?.enabled) {
    const jacketUnitPrice = getCoverUnitPrice(form.jacket.paper, form.jacket.weight);
    let jacketCost = jacketUnitPrice * qty;
    if (form.jacket.printing === '양면 4도') {
      jacketCost += getExtraCharge(rangeConfig.extraCharges.doubleSidedPrinting) * qty;
    }
    extras.push({ name: '자켓', cost: jacketCost });
  }
  
  let endpaperTotal = 0;
  let endpaperDiscount = 0;
  if (form.postProcessing?.endpaper && form.postProcessing.endpaper !== '없음') {
    const charge = rangeConfig.extraCharges.endpaper;
    if (charge) {
      endpaperTotal = getExtraCharge(charge) * (form.postProcessing.endpaperPages || 0) * qty;
      endpaperDiscount = form.applyDiscount ? Math.round(endpaperTotal * 0.5) : 0; // 50% discount if checked
    }
  }
  
  if (form.postProcessing?.epoxy) {
    extras.push({ name: '에폭시', cost: getExtraCharge(rangeConfig.extraCharges.epoxy) * qty });
  }
  if (form.postProcessing?.foil && form.postProcessing.foil !== '없음') {
    const charge = rangeConfig.extraCharges.foil;
    if (charge) {
      extras.push({ name: `박 (${form.postProcessing.foil})`, cost: getExtraCharge(charge) * qty });
    }
  }

  const extrasTotal = extras.reduce((sum, item) => sum + item.cost, 0);
  const endpaperFinal = endpaperTotal - endpaperDiscount;

  // 4. Shipping calculation (Box count)
  // Assuming ~10,000 total pages per box (e.g. 50 books of 200 pages)
  const totalPagesSum = form.innerSections.reduce((s, n) => s + n.pages, 0);
  const totalProducedPages = totalPagesSum * qty;
  const boxCount = Math.max(1, Math.ceil(totalProducedPages / 10000));
  const shippingCost = boxCount * (priceConfig.globalShippingCost || 5000);

  const total = innerFinal + coverFinal + extrasTotal + endpaperFinal + shippingCost;

  return {
    inner: { base: innerTotal, discount: innerDiscount, final: innerFinal },
    cover: { base: coverTotal, discount: coverDiscount, final: coverFinal },
    endpaper: { base: endpaperTotal, discount: endpaperDiscount, final: endpaperFinal },
    extras,
    extrasTotal,
    shipping: { boxCount, cost: shippingCost },
    total: Math.round(total)
  };
};
