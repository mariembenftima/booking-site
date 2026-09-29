import * as migration_20260929_220047_initial from './20260929_220047_initial';

export const migrations = [
  {
    up: migration_20260929_220047_initial.up,
    down: migration_20260929_220047_initial.down,
    name: '20260929_220047_initial'
  },
];
