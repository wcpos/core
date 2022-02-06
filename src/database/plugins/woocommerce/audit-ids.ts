import forEach from 'lodash/forEach';
import find from 'lodash/find';
import pull from 'lodash/pull';
import map from 'lodash/map';

type RxCollection = import('rxdb/dist/types').RxCollection;

/**
 * Match ids from server and local database
 * @TODO - works only on pouch internals, make general
 */
export async function auditRestApiIds(this: RxCollection, data: Record<string, any>[]) {
	// fetch all ids from local database
	const { docs } = await this.storageInstance.internals.pouch
		.find({
			selector: { id: { $exists: true } },
			fields: ['id'],
		})
		.catch((err: any) => {
			console.log(err);
		});

	// compare local and server ids
	const add = data.filter((d) => !find(docs, { id: d.id })).map((d) => ({ ...d, _deleted: false }));

	const remove = docs
		.filter((d) => !find(data, { id: d.id }))
		.map((d) => ({ ...d, _deleted: true }));

	// return changes to replication plugin
	return add.concat(remove);
}
