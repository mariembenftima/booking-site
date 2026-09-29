import * as migration_20260929_220047_initial from './20260929_220047_initial';
import * as migration_20260929_222711_localization from './20260929_222711_localization';

export const migrations = [
  {
    up: migration_20260929_220047_initial.up,
    down: migration_20260929_220047_initial.down,
    name: '20260929_220047_initial',
  },
  {
    up: migration_20260929_222711_localization.up,
    down: migration_20260929_222711_localization.down,
    name: '20260929_222711_localization'
  },
];
