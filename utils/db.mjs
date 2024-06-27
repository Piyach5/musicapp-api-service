import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:ZTvQYiiUwwwEluVhcNQYcQIyCakNTFgT@monorail.proxy.rlwy.net:17453/railway",
});

export default connectionPool;
