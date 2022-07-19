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
    response(res, directories.map((dir, idx) => ({ id: idx + 1, name: dir })));
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
    response(res, result.map((row) => ({ id: row.name })));
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
    const offset = reqUrl.searchParams.get('offset') ?? 0;
    const limit = reqUrl.searchParams.get('limit') ?? 24;

    const result = await db.all(`SELECT * FROM ${collectionId} LIMIT ${limit} OFFSET ${offset}`);
    response(res, result.map((row) => ({ data: row })));
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
    const columns = Object.keys(req.body).join(',');
    const values = Object.values(req.body).map((v) => `'${v}'`).join(',');
    try {
      await db.run(`INSERT INTO ${collectionId} (${columns}) VALUES (${values})`);
    } catch (error) {
      res.statusCode = 400;
      res.send({ error: error.message });
    }
    const result = await db.get(`SELECT * FROM ${collectionId} ${whereParser(req.body)}`);
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
    const result = await db.all(`SELECT * FROM ${collectionId} ${whereParser(matcher)}`);
    response(res, result.map((row) => ({ data: row })));
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
    const setter = Object.entries(req.body.data).map(([k, v]) => `${k}='${v}'`).join(', ');
    try {
      await db.run(`UPDATE ${collectionId} SET ${setter} ${whereParser(matcher)}`);
    } catch (error) {
      res.statusCode = 400;
      res.send({ error: error.message });
    }
    const result = await db.get(`SELECT * FROM ${collectionId} ${whereParser(req.body.data)}`);
    response(res, { data: result });
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
    try {
      await db.run(`DELETE FROM ${collectionId} ${whereParser(matcher)}`);
    } catch (error) {
      res.statusCode = 400;
      res.send({ error: error.message });
    }
  },
};
