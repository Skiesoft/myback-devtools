import fs from 'fs';
import { URL } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Parse request into resourceID, collectionID, objectID, and URL
 *
 * @param {IncomingMessage} req Incoming request.
 * @returns An object containing all parsed information.
 */
function parseReq(req) {
  const url = new URL(`api/v1${req.url}`, 'http://localhost/');
  const segments = req.url.split('/').filter((s) => s);
  return {
    url,
    resourceId: segments[1],
    collectionId: segments[3],
    objectId: segments[5],
  };
}

/**
 * List all files in the given path, for listing all available databases.
 *
 * @param {String} path Relative path to the directory where SQLite database is located.
 * @returns {String[]}
 */
function listDataDir(path = '') {
  return fs.readdirSync(`./data/${path}`);
}

/**
 * Open the requested database.
 *
 * @param {IncomingMessage} req Incoming request from the middleware.
 * @returns SQLite database object.
 */
async function getDB(req) {
  const { resourceId } = parseReq(req);
  const resource = listDataDir()[resourceId - 1];

  const db = await open({
    filename: `./data/${resource}`,
    driver: sqlite3.Database,
  });
  return db;
}

/**
 * Translate a mongodb like query object into SQL statement.
 *
 * @param {Object} elements The query object
 * @returns {String}
 */
function whereParser(elements) {
  if (!elements) return '';
  const ref = {
    $lt: '<',
    $lte: '<=',
    $gt: '>',
    $gte: '<=',
    $ne: '!=',
  };
  const whereArray = [];
  Object.entries(elements).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((v, k) => {
        whereArray.push(`${key}${ref[k]}'${v}'`);
      });
    } else {
      whereArray.push(`${key}='${val}'`);
    }
  });
  const sqlStatement = `WHERE ${whereArray.join(' AND ')}`;
  return sqlStatement;
}

/**
 * Helper function to send object as json format.
 *
 * @param {ServerResponse} res
 * @param obj
 */
function response(res, obj) {
  res.send(JSON.stringify(obj));
}

export default {
  /**
   * Get all available resources (databases).
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getResources: async (req, res) => {
    const directories = listDataDir('/');
    response(res, { data: directories.map((dir, idx) => ({ id: idx + 1, name: dir })) });
  },
  /**
   * Get a list of collection (table) from designated database in the request.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getCollections: async (req, res) => {
    const db = await getDB(req);
    const result = await db.all("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'");
    response(res, { data: result.map((row) => ({ id: row.name })) });
  },
  /**
   * Retrieve data from requested resource and collection in a page manner.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getPage: async (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = await getDB(req);
    const page = reqUrl.searchParams.get('page') ?? 0;
    const pageSize = reqUrl.searchParams.get('pageSize') ?? 24;
    const result = await db.all(`SELECT * FROM ${collectionId} LIMIT ${pageSize} OFFSET ${page * pageSize}`);
    response(res, { data: result });
  },
  /**
   * Create a new record contained in the request.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  createObject: async (req, res) => {
    const { collectionId } = parseReq(req);
    const db = await getDB(req);
    if (!req.body) {
      res.statusCode = 400;
      response(res, { data: { error: 'Missing Body' } });
      return;
    }
    const columns = Object.keys(req.body.data).join(',');
    const values = Object.values(req.body.data).map((v) => `'${v}'`).join(',');
    try {
      await db.run(`INSERT INTO ${collectionId} (${columns}) VALUES (${values})`);
    } catch (error) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: error.message }));
    }
    const rowid = (await db.get('SELECT last_insert_rowid()'))['last_insert_rowid()'];
    const result = await db.get(`SELECT * FROM ${collectionId} WHERE rowid=${rowid}`);
    response(res, { data: result });
  },
  /**
   * Query an object that met the requirement of matcher string.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  queryObject: async (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = await getDB(req);
    const matcher = JSON.parse(reqUrl.searchParams.get('matcher'));
    const page = reqUrl.searchParams.get('page') ?? 0;
    const pageSize = reqUrl.searchParams.get('pageSize') ?? 24;
    if (matcher === null) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Missing Matcher' }));
      return;
    }
    Object.keys(matcher).forEach((key) => {
      if (matcher[key] === null) {
        delete matcher[key];
      }
    });
    const result = await db.all(`SELECT * FROM ${collectionId} ${whereParser(matcher)} LIMIT ${pageSize} OFFSET ${page * pageSize}`);
    response(res, { data: result });
  },
  /**
   * Update the record requested by the request.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  updateObject: async (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = await getDB(req);
    const matcher = JSON.parse(reqUrl.searchParams.get('matcher'));
    if (!req.body.data) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Missing Body' }));
      return;
    }
    if (!matcher) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Missing Matcher' }));
      return;
    }
    const setter = Object.entries(req.body.data).map(([k, v]) => `${k}='${v}'`).join(', ');
    Object.keys(matcher).forEach((key) => {
      if (matcher[key] === null) {
        delete matcher[key];
      }
    });
    try {
      const rowid = Object.values(await db.get(`SELECT rowid FROM ${collectionId} ${whereParser(matcher)}`))[0];
      await db.run(`UPDATE ${collectionId} SET ${setter} WHERE rowid=${rowid}`);
      const result = await db.get(`SELECT * FROM ${collectionId} WHERE rowid=${rowid}`);
      response(res, { data: result });
    } catch (error) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: error.message }));
    }
  },
  /**
   * Delete the requested object.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  deleteObject: async (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = await getDB(req);
    const matcher = JSON.parse(reqUrl.searchParams.get('matcher'));
    if (matcher === null) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Missing Matcher' }));
      return;
    }
    Object.keys(matcher).forEach((key) => {
      if (matcher[key] === null) {
        delete matcher[key];
      }
    });
    try {
      await db.run(`DELETE FROM ${collectionId} WHERE rowid=(SELECT rowid FROM ${collectionId} ${whereParser(matcher)} LIMIT 1)`);
    } catch (error) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: error.message }));
    }
  },
  /**
   * Get related objects of an object.
   *
   * @param {IncomingRequest} req 
   * @param {ServerResponse} res 
   */
  getRelation: async (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = await getDB(req);
    const matcher = JSON.parse(reqUrl.searchParams.get('matcher'));
    if (matcher === null) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Missing Matcher' }));
      return;
    }
    Object.keys(matcher).forEach((key) => {
      if (matcher[key] === null) {
        delete matcher[key];
      }
    });
    try {
      const row = await db.get(`SELECT * FROM ${collectionId} ${whereParser(matcher)}`);
      const outForeignKeys = await db.all(`SELECT * FROM pragma_foreign_key_list('${collectionId}')`);
      const outboundRelation = {};
      for (const { from, to, table } of outForeignKeys) {
        const data = await db.all(`SELECT * FROM ${table} WHERE ${to}=${row[from]}`);
        outboundRelation[table] = { data };
      }
      const tables = (await db.all("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'"))
        .filter(({ name }) => name !== collectionId);
      const inboundRelation = {};
      for (const { name } of tables) {
        const foreignKeys = await db.all(`SELECT * FROM pragma_foreign_key_list('${name}')`);
        for (const foreignKey of foreignKeys) {
          if (foreignKey.table !== collectionId) { continue; }
          const data = await db.all(`SELECT * FROM ${name} WHERE ${foreignKey.from}=${row[foreignKey.to]}`);
          inboundRelation[name] = { data: (inboundRelation[name]?.data ?? []).concat(data) };
        }
      }
      response(res, { in: inboundRelation, out: outboundRelation });
    } catch (error) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: error.message }));
    }
  },
};
