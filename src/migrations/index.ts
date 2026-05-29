import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260528_232145 from './20260528_232145';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260528_232145.up,
    down: migration_20260528_232145.down,
    name: '20260528_232145'
  },
];
