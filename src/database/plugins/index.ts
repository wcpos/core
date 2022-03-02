import { addRxPlugin } from 'rxdb/plugins/core';

// default plugins
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
// import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import { RxDBKeyCompressionPlugin } from 'rxdb/plugins/key-compression';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
// import { RxDBReplicationCouchDBPlugin } from 'rxdb/plugins/replication-couchdb';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
// import { RxDBInMemoryPlugin } from 'rxdb/plugins/in-memory';
// import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

// custom plugins
import collectionsHelper from './utils/collections';
import collectionCounts from './collection-counts';
import RxDBGenerateIdPlugin from './generate-id';
import RxDBWooCommercePlugin from './woocommerce';
import childrenPlugin from './children';
import { RxDBAjvValidatePlugin } from './validate';

if (process.env.NODE_ENV === 'development') {
	// in dev-mode we add the dev-mode plugin
	// which does many checks and adds full error messages
	// also, only add on first render, seems to be conflict with HMR
	// if (!module?.hot?.data) {
	// 	addRxPlugin(RxDBDevModePlugin);
	// }
	addRxPlugin(RxDBDevModePlugin);

	// add debugging
	// @ts-ignore
	// import('pouchdb-debug').then((pouchdbDebug) => {
	// 	PouchDB.plugin(pouchdbDebug.default);
	// 	PouchDB.debug.enable('*');
	// });
}

// default plugins
addRxPlugin(RxDBLocalDocumentsPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBEncryptionPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBKeyCompressionPlugin);
addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBKeyCompressionPlugin);

// custom plugins
addRxPlugin(collectionsHelper);
addRxPlugin(collectionCounts);
addRxPlugin(RxDBGenerateIdPlugin);
addRxPlugin(RxDBWooCommercePlugin);
addRxPlugin(childrenPlugin);
addRxPlugin(RxDBAjvValidatePlugin);
