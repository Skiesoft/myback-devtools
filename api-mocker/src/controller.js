import fs from 'fs';
import { URL } from 'url';
import Database from 'better-sqlite3';

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
  return fs.readdirSync(`./data/${path}`).sort();
}

/**
 * Open the requested database.
 *
 * @param {IncomingMessage} req Incoming request from the middleware.
 * @returns SQLite database object.
 */
function getDB(req) {
  const { resourceId } = parseReq(req);
  let resource;
  if (isNaN(resourceId)) {
    resource = `${resourceId}.db`;
  } else {
    resource = listDataDir()[resourceId - 1];
  }

  if (!fs.existsSync(`./data/${resource}`)) {
    return undefined;
  }

  const db = new Database(`./data/${resource}`);
  db.function('regexp', { deterministic: true }, (regex, text) => (new RegExp(regex).test(text) ? 1 : 0));
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
    if (typeof val === 'object') {
      Object.entries(val).forEach(([k, v]) => {
        if (k === '$like') {
          whereArray.push(`${key} LIKE '%${v}%'`);
        } else {
          whereArray.push(`${key}${ref[k]}'${v}'`);
        }
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
  getResources: (req, res) => {
    const directories = listDataDir('/');
    response(res, { mapped: { data: directories.map((dir) => ({ id: dir.substring(0, dir.lastIndexOf('.')) })) }, original: { data: directories.sort().map((dir, idx) => ({ id: idx + 1 })) } });
  },
  /**
   * Get a list of collection (table) from designated database in the request.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getCollections: (req, res) => {
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
    const stmt = db.prepare("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'");
    const result = stmt.all();
    response(res, { data: result.map((row) => ({ id: row.name })) });
  },
  /**
   * Retrieve data from requested resource and collection in a page manner.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getPage: (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
    const page = reqUrl.searchParams.get('page') ?? 0;
    const pageSize = reqUrl.searchParams.get('pageSize') ?? 24;
    const stmt = db.prepare(`SELECT * FROM ${collectionId} LIMIT ${pageSize} OFFSET ${page * pageSize}`);
    const result = stmt.all();
    response(res, { data: result });
  },
  /**
   * Create a new record contained in the request.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  createObject: (req, res) => {
    const { collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
    }
    if (!req.body) {
      res.statusCode = 400;
      response(res, { data: { error: 'Missing Body' } });
      return;
    }
    const columns = Object.keys(req.body.data).join(',');
    const values = Object.values(req.body.data).map((v) => `'${v}'`).join(',');
    try {
      const stmt = db.prepare(`INSERT INTO ${collectionId} (${columns}) VALUES (${values})`);
      stmt.run();
    } catch (error) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: error.message }));
    }
    let stmt = db.prepare('SELECT last_insert_rowid() AS rowid');
    const { rowid } = stmt.get();
    stmt = db.prepare(`SELECT * FROM ${collectionId} WHERE rowid=${rowid}`);
    const result = stmt.get();
    response(res, { data: result });
  },
  /**
   * Query an object that met the requirement of matcher string.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  queryObject: (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
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
    const stmt = db.prepare(`SELECT * FROM ${collectionId} ${whereParser(matcher)} LIMIT ${pageSize} OFFSET ${page * pageSize}`);
    const result = stmt.all();
    response(res, { data: result });
  },
  /**
   * Update the record requested by the request.
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  updateObject: (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
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
      const rowid = Object.values(db.prepare(`SELECT rowid FROM ${collectionId} ${whereParser(matcher)}`).get())[0];
      db.prepare(`UPDATE ${collectionId} SET ${setter} WHERE rowid=${rowid}`).run();
      const result = db.prepare(`SELECT * FROM ${collectionId} WHERE rowid=${rowid}`).get();
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
  deleteObject: (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
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
      const stmt = db.prepare(`DELETE FROM ${collectionId} WHERE rowid=(SELECT rowid FROM ${collectionId} ${whereParser(matcher)} LIMIT 1)`);
      stmt.run();
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
  getRelation: (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
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
      const row = db.prepare(`SELECT * FROM ${collectionId} ${whereParser(matcher)}`).get();
      const outForeignKeys = db.prepare(`SELECT * FROM pragma_foreign_key_list('${collectionId}')`).all();
      const outboundRelation = {};
      for (const { from, to, table } of outForeignKeys) {
        const data = db.prepare(`SELECT * FROM ${table} WHERE ${to}=${row[from]}`).all();
        outboundRelation[table] = { data };
      }
      const tables = (db.prepare("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'").all())
        .filter(({ name }) => name !== collectionId);
      const inboundRelation = {};
      for (const { name } of tables) {
        const foreignKeys = db.prepare(`SELECT * FROM pragma_foreign_key_list('${name}')`).all();
        for (const foreignKey of foreignKeys) {
          if (foreignKey.table !== collectionId) { continue; }
          const data = db.prepare(`SELECT * FROM ${name} WHERE ${foreignKey.from}=${row[foreignKey.to]}`).all();
          inboundRelation[name] = { data: (inboundRelation[name]?.data ?? []).concat(data) };
        }
      }
      response(res, { in: inboundRelation, out: outboundRelation });
    } catch (error) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: error.message }));
    }
  },
  /**
   * Get count of object that fulfill given matcher
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getCount: (req, res) => {
    const { url: reqUrl, collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
    const matcher = JSON.parse(reqUrl.searchParams.get('matcher'));
    const count = (db.prepare(`SELECT COUNT(*) FROM ${collectionId} ${whereParser(matcher)}`).get())['COUNT(*)'];
    res.send(JSON.stringify({ data: count }));
  },

  /**
   * Get collection schema
   *
   * @param {IncomingRequest} req
   * @param {ServerResponse} res
   */
  getSchema: (req, res) => {
    const typeMapper = (type) => {
      const mapper = {
        INT: 'integer',
        INTEGER: 'integer',
        TINYINT: 'integer',
        SMALLINT: 'integer',
        MEDIUMINT: 'integer',
        BIGINT: 'integer',
        'UNSIGNED BIG INT': 'integer',
        INT2: 'integer',
        INT8: 'integer',
        CHARACTER: 'text',
        VARCHAR: 'text',
        'VARYING CHARACTER': 'text',
        NCHAR: 'text',
        'NATIVE CHARACTER': 'text',
        NVARCHAR: 'text',
        TEXT: 'text',
        CLOB: 'text',
        BLOB: 'blob',
        REAL: 'float',
        DOUBLE: 'float',
        'DOUBLE PRECISION': 'float',
        FLOAT: 'float',
        BOOLEAN: 'decimal',
        DATE: 'decimal',
        DATETIME: 'decimal',
        NUMERIC: 'decimal',
        DECIMAL: 'decimal',
      };
      if (mapper[type] !== undefined) { return mapper[type]; }
      const textRegex = [
        /CHARACTER([0-9]+)/,
        /VARCHAR([0-9]+)/,
        /VARYING CHARACTER([0-9]+)/,
        /NCHAR([0-9]+)/,
        /NATIVE CHARACTER([0-9]+)/,
        /NVARCHAR([0-9]+)/,
      ];
      textRegex.forEach((e) => {
        if (e.test(type)) { return 'text'; }
      });
      if (/DECIMAL([0-9]+,[0-9]+)/.test(type)) { return 'decimal'; }
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Type error' }));
      throw new Error('Type error');
    };
    const { collectionId } = parseReq(req);
    const db = getDB(req);
    if (db === undefined) {
      res.statusCode = 400;
      response(res, { data: { error: 'Database not found' } });
      return;
    }
    try {
      const result = db.prepare(`PRAGMA table_info(${collectionId});`).all();
      res.send(JSON.stringify({
        data: Object.fromEntries(result.map(({ name, type }) => ([name, typeMapper(type.toUpperCase())]))),
      }));
    } catch (error) {
      console.log(error);
    }
  },
};
