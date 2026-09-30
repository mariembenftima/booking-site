import * as migration_20260929_220047_initial from './20260929_220047_initial';
import * as migration_20260929_222711_localization from './20260929_222711_localization';
import * as migration_20260929_224409_services from './20260929_224409_services';
import * as migration_20260929_224926_services from './20260929_224926_services';
import * as migration_20260929_225805_services from './20260929_225805_services';
import * as migration_20260929_225824_globals from './20260929_225824_globals';
import * as migration_20260930_010424_blob_object_key from './20260930_010424_blob_object_key';

export const migrations = [
  {
    up: migration_20260929_220047_initial.up,
    down: migration_20260929_220047_initial.down,
    name: '20260929_220047_initial',
  },
  {
    up: migration_20260929_222711_localization.up,
    down: migration_20260929_222711_localization.down,
    name: '20260929_222711_localization',
  },
  {
    up: migration_20260929_224409_services.up,
    down: migration_20260929_224409_services.down,
    name: '20260929_224409_services',
  },
  {
    up: migration_20260929_224926_services.up,
    down: migration_20260929_224926_services.down,
    name: '20260929_224926_services',
  },
  {
    up: migration_20260929_225805_services.up,
    down: migration_20260929_225805_services.down,
    name: '20260929_225805_services',
  },
  {
    up: migration_20260929_225824_globals.up,
    down: migration_20260929_225824_globals.down,
    name: '20260929_225824_globals',
  },
  {
    up: migration_20260930_010424_blob_object_key.up,
    down: migration_20260930_010424_blob_object_key.down,
    name: '20260930_010424_blob_object_key'
  },
];
