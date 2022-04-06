import { createRxDatabase, removeRxDatabase } from 'rxdb/plugins/core';
import Platform from '@wcpos/common/src/lib/platform';
import set from 'lodash/set';
import config from './adapter';
import './plugins';

/**
 * creates the generic database
 */
export async function createDB<T>(name: string) {
	const db = await createRxDatabase<T>({
		name,
		...config,
		password: 'posInstanceId',
	});

	// add to window for debugging
	// if (Platform.OS === 'web') {
	// 	if (!(window as any).dbs) {
	// 		set(window, 'dbs', {});
	// 	}
	// 	(window as any).dbs[name] = db;
	// }

	return db;
}

/**
 * deletes the generic database
 */
export async function removeDB(name: string) {
	return removeRxDatabase(name, config.storage);
}
