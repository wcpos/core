import { from, combineLatest } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import isFinite from 'lodash/isFinite';

/**
 * Calculate quantity * price
 * @TODO - question: is it possible to hook in before qty or price
 * changes and then emit with updated total?
 */
export default (raw, model) => {
	combineLatest([model.quantity$, model.price$])
		.pipe(tap((res) => console.log(res)))
		.subscribe((val) => {
			const total = val[0] * val[1];
			if (isFinite(total)) {
				model.atomicSet('total', String(total));
			}
		});
};