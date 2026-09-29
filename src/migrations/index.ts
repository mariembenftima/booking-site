import * as migration_20260929_220047_initial from './20260929_220047_initial';
import * as migration_20260929_222711_localization from './20260929_222711_localization';
import * as migration_20260929_224409_services from './20260929_224409_services';
import * as migration_20260929_224926_services from './20260929_224926_services';

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
    name: '20260929_224926_services'
  },
];
