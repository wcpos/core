import flatten from 'lodash/flatten';
import forEach from 'lodash/forEach';
import groupBy from 'lodash/groupBy';
import isNaN from 'lodash/isNaN';
import map from 'lodash/map';
import reverse from 'lodash/reverse';
import round from 'lodash/round';
import sortBy from 'lodash/sortBy';
import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';
import toNumber from 'lodash/toNumber';

type LineItemDocument = import('@wcpos/database').LineItemDocument;
type FeeLineDocument = import('@wcpos/database').FeeLineDocument;
type ShippingLineDocument = import('@wcpos/database').ShippingLineDocument;
type CartItem = LineItemDocument | FeeLineDocument | ShippingLineDocument;
export type Cart = CartItem[];

type TaxRateDocument = import('@wcpos/database').TaxRateDocument;
interface Tax {
	id: number;
	total: string;
}
type TaxArray = Tax[];
interface Rate {
	id: number;
	rate: string;
}
type RateArray = Rate[];

export function toValidNumber(value: string | number | undefined | null): number {
	const num = toNumber(value); // Convert the value to a number
	return isNaN(num) ? 0 : num; // Return 0 if the result is NaN, otherwise return the number
}

export function toRoundedNumber(value: string | number | undefined | null): number {
	return round(toValidNumber(value), 6); // Round the number to 6 decimal places
}

/**
 * Round all taxes to precision (4DP) before passing them back. Note, this is not the same rounding
 * as in the cart calculation class which, depending on settings, will round to 2DP when calculating
 * final totals. Also unlike that class, this rounds .5 up for all cases.
 */
function roundedTaxStrings(taxes: TaxArray) {
	const roundedTaxes: TaxArray = [];
	forEach(taxes, (tax) => {
		roundedTaxes.push({ id: tax.id, total: String(toRoundedNumber(tax.total), 6) });
	});
	return roundedTaxes;
}

/**
 * Calculate taxes when price includes tax
 */
function calcInclusiveTax(price: number, rates: TaxRateDocument[]) {
	const taxes: TaxArray = [];
	const compoundRates: RateArray = [];
	const regularRates: RateArray = [];
	let nonCompoundPrice = price;

	// Index array so taxes are output in correct order and see what compound/regular rates we have to calculate.
	forEach(rates, (_rate) => {
		const { id = '0', rate = '0', compound = false } = _rate;

		if (compound) {
			compoundRates.push({ id, rate });
		} else {
			regularRates.push({ id, rate });
		}
	});

	reverse(compoundRates); // Working backwards.

	forEach(compoundRates, (compoundRate) => {
		const { id, rate } = compoundRate;
		const total = nonCompoundPrice - nonCompoundPrice / (1 + toValidNumber(rate) / 100);
		taxes.push({ id, total: String(total) });
		nonCompoundPrice -= total;
	});

	// Regular taxes.
	const regularTaxRate =
		1 + sumBy(regularRates, (regularRate) => toValidNumber(regularRate.rate) / 100);

	forEach(regularRates, (regularRate) => {
		const { id, rate } = regularRate;
		const theRate = parseFloat(rate) / 100 / regularTaxRate;
		const netPrice = price - theRate * nonCompoundPrice;
		const total = price - netPrice;
		taxes.push({ id, total: String(total) });
	});

	return roundedTaxStrings(taxes);
}

/**
 * Calculate taxes when price excludes tax
 */
function calcExclusiveTax(price: number, rates: TaxRateDocument[]) {
	const taxes: TaxArray = [];

	forEach(rates, (_rate) => {
		const { id = '0', rate = '0', compound = false } = _rate;

		if (!compound) {
			const total = price * (toValidNumber(rate) / 100);
			taxes.push({ id, total: String(total) });
		}
	});

	let preCompoundTotal = sumBy(taxes, (tax) => toValidNumber(tax.total));

	// Compound taxes.
	forEach(rates, (_rate) => {
		const { id = '0', rate = '0', compound = false } = _rate;

		if (compound) {
			const thePriceIncTax = price + preCompoundTotal;
			const total = thePriceIncTax * (toValidNumber(rate) / 100);
			taxes.push({ id, total: String(total) });
			preCompoundTotal = sumBy(taxes, (tax) => toValidNumber(tax.total));
		}
	});

	return roundedTaxStrings(taxes);
}

/**
 * Takes a price and an array of tax rates, eg: [{ id: 1, rate: '4.0000', order: 1 }]
 * Returns the calculated array of taxes tax, eg: [{ id: 1, total: 1.2345 }]
 */
export function calculateTaxes(price: number, rates: TaxRateDocument[], pricesIncludeTax = false) {
	const sortedRates = sortBy(rates, 'order');

	return pricesIncludeTax
		? calcInclusiveTax(price, sortedRates)
		: calcExclusiveTax(price, sortedRates);
}

/**
 *
 */
export function sumTaxes(taxes: TaxArray, rounding = true) {
	const sum = sumBy(taxes, (tax) => toValidNumber(tax.total));
	if (rounding) {
		return round(sum, 6);
	}
	return sum;
}

/**
 *
 */
export function sumItemizedTaxes(taxes: TaxArray, round = true) {
	// group taxes by id
	const groupedTaxes = groupBy(flatten(taxes), 'id');
	return map(groupedTaxes, (itemized, id) => ({
		id,
		total: String(sumTaxes(itemized)),
	}));
}

/**
 * Calculate the display values for a price with or without taxes
 */
export function calculateDisplayValues({
	value,
	rates,
	pricesIncludeTax,
	inclOrExcl,
	taxRoundAtSubtotal,
}: {
	value?: string | number;
	rates: TaxRateDocument[];
	pricesIncludeTax: boolean;
	inclOrExcl: 'incl' | 'excl';
	taxRoundAtSubtotal: boolean;
}) {
	const valueAsNumber = toValidNumber(value);
	const taxes = calculateTaxes(valueAsNumber, rates, pricesIncludeTax);
	const itemizedTaxTotals = sumItemizedTaxes(taxes, taxRoundAtSubtotal);
	const taxTotal = sumTaxes(itemizedTaxTotals);
	let displayValue = String(valueAsNumber);

	if (pricesIncludeTax && inclOrExcl === 'excl') {
		displayValue = String(round(valueAsNumber - taxTotal, 6));
	}

	if (!pricesIncludeTax && inclOrExcl === 'incl') {
		displayValue = String(round(valueAsNumber + taxTotal, 6));
	}

	return {
		displayValue,
		taxTotal: String(taxTotal),
		inclOrExcl,
	};
}

/**
 * Calculate line item totals
 */
export function calculateLineItemTotals({
	quantity,
	price,
	total,
	rates,
	pricesIncludeTax,
	taxRoundAtSubtotal,
}: {
	quantity: number;
	price: string;
	total: string;
	rates: TaxRateDocument[];
	pricesIncludeTax: boolean;
	taxRoundAtSubtotal: boolean;
}) {
	// Subtotal
	const priceAsFloat = toValidNumber(price);
	const subtotal = quantity * priceAsFloat;
	const subtotalTaxes = calculateTaxes(subtotal, rates);
	const itemizedSubTotalTaxes = sumItemizedTaxes(subtotalTaxes, taxRoundAtSubtotal);

	// Total
	const totalTaxes = calculateTaxes(toValidNumber(total), rates);
	const itemizedTotalTaxes = sumItemizedTaxes(totalTaxes, taxRoundAtSubtotal);
	const taxes = itemizedSubTotalTaxes.map((obj) => {
		const index = itemizedTotalTaxes.findIndex((el) => el.id === obj.id);
		const totalTax = index !== -1 ? itemizedTotalTaxes[index] : { total: 0 };
		return {
			id: obj.id,
			subtotal: String(obj.total ?? 0),
			total: String(totalTax.total ?? 0),
		};
	});

	return {
		subtotal: String(subtotal),
		subtotal_tax: String(sumTaxes(subtotalTaxes, taxRoundAtSubtotal)),
		total: String(total),
		total_tax: String(sumTaxes(totalTaxes, taxRoundAtSubtotal)),
		taxes,
	};
}

/**
 *
 */
export function calculateOrderTotalsAndTaxes({
	lineItems,
	shippingLines,
	feeLines,
	taxRates,
	taxRoundAtSubtotal,
}: {
	lineItems: LineItemDocument[];
	shippingLines: ShippingLineDocument[];
	feeLines: FeeLineDocument[];
	taxRates: TaxRateDocument[];
	taxRoundAtSubtotal: boolean;
}) {
	let discount_total = 0;
	let discount_tax = 0;
	let shipping_total = 0;
	let shipping_tax = 0;
	let cart_tax = 0;
	let subtotal = 0;
	let subtotal_tax = 0;
	let total = 0;
	let total_tax = 0;
	let fee_total = 0;
	let fee_tax = 0;

	const taxLines = taxRates.map((taxRate) => ({
		rate_id: parseInt(taxRate.id, 10),
		label: taxRate.name,
		compound: taxRate.compound,
		tax_total: 0,
		shipping_tax_total: 0,
		rate_percent: toValidNumber(taxRate.rate),
		meta_data: [],
	}));

	// Calculate line item totals
	lineItems.forEach((item) => {
		discount_total += toValidNumber(item.subtotal) - toValidNumber(item.total);
		discount_tax += toValidNumber(item.subtotal_tax) - toValidNumber(item.total_tax);
		subtotal += toValidNumber(item.subtotal);
		subtotal_tax += toValidNumber(item.subtotal_tax);
		total += toValidNumber(item.total);
		total_tax += toValidNumber(item.total_tax);

		item.taxes.forEach((tax) => {
			const taxLine = taxLines.find((taxLine) => taxLine.rate_id === parseInt(tax.id, 10));
			if (taxLine) {
				taxLine.tax_total += toValidNumber(tax.total);
			}
		});
	});

	// Calculate fee totals
	feeLines.forEach((line) => {
		fee_total += toValidNumber(line.total);
		fee_tax += toValidNumber(line.total_tax);
		total += toValidNumber(line.total);
		total_tax += toValidNumber(line.total_tax);

		line.taxes.forEach((tax) => {
			const taxLine = taxLines.find((taxLine) => taxLine.rate_id === parseInt(tax.id, 10));
			if (taxLine) {
				taxLine.tax_total += toValidNumber(tax.total);
			}
		});
	});

	// Calculate shipping totals
	shippingLines.forEach((line) => {
		shipping_total += toValidNumber(line.total);
		shipping_tax += toValidNumber(line.total_tax);
		total += toValidNumber(line.total);
		total_tax += toValidNumber(line.total_tax);

		line.taxes.forEach((tax) => {
			const taxLine = taxLines.find((taxLine) => taxLine.rate_id === parseInt(tax.id, 10));
			if (taxLine) {
				taxLine.shipping_tax_total += toValidNumber(tax.total);
			}
		});
	});

	taxLines.forEach((taxLine) => {
		cart_tax += taxLine.tax_total;
		taxLine.tax_total = String(round(taxLine.tax_total, 6));
		taxLine.shipping_tax_total = String(round(taxLine.shipping_tax_total, 6));
	});

	// Remove tax lines with 0 tax total
	const filteredTaxLines = taxLines.filter((taxLine) => toValidNumber(taxLine.tax_total) !== 0);

	return {
		discount_total: String(round(discount_total, 6)),
		discount_tax: String(round(discount_tax, 6)),
		shipping_total: String(round(shipping_total, 6)),
		shipping_tax: String(round(shipping_tax, 6)),
		cart_tax: String(round(cart_tax, 6)),
		subtotal: String(round(subtotal, 6)),
		subtotal_tax: String(round(subtotal_tax, 6)),
		total: String(round(total + total_tax, 6)),
		total_tax: String(round(total_tax, 6)),
		tax_lines: filteredTaxLines,
		/**
		 * Need to add fee_total to display in the cart, to match the WC Admin display
		 */
		fee_total: String(round(fee_total, 6)),
		fee_tax: String(round(fee_tax, 6)),
	};
}
