import React, { useEffect, useState } from "react";
import "./App.css";
import { SDK } from 'myback-sdk';

function App() {
  const sdk = new SDK();
  const [collections, setCollections] = useState();
  const [workingCollection, setWorkingCollection] = useState();
  const [objects, setObjects] = useState();
  const [keys, setKeys] = useState([]);
  const [values, setValues] = useState([]);
  const [page, setPage] = useState(0);
  const [relation, setRelation] = useState();

  const fetchCollections = async () => {
    try {
      let response = await sdk.getResources();
      response = await response[0].getCollections();
      setCollections(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchData = async () => {
    try {
      const response = await workingCollection?.getPage(page);
      setObjects(response);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, [workingCollection, page]);

  const createObjectFromFormTable = async () => {
    const obj = Object.assign.apply({}, keys.map((v, i) => ({ [v]: values[i] })));
    await workingCollection?.createObject(obj);
    await fetchData();
  };

  return (
    <div className="App">
      <h1>Collections</h1>
      {collections?.map((collection, index) => <h2 key={index}>{collection.collectionId}</h2>)}
      <div>
        <span>working collection: </span>
        <input type='text' onChange={e => setWorkingCollection(collections?.find(v => v.collectionId == e.target.value))}></input>
      </div>
      {objects?.map((object, index) => <div key={index}>
        {((obj) => {
          let ret = [];
          let i = 0;
          for (const [key, value] of Object.entries(obj.properties)) {
            ret.push(<div key={i++}>
              <b>{key}:</b> {value}
              <button onClick={() => {
                obj.destroy();
                fetchData();
              }}> - </button>
              <button onClick={async () => {
                setRelation(await object.getRelation());
              }}> <b>*</b> </button>
            </div>)
          }
          return ret;
        })(object)}
      </div>)}
      <div>
        <button onClick={() => { setPage((page - 1 >= 0) ? page - 1 : page) }}>&lt;</button>
        {page}
        <button onClick={() => { setPage(page + 1) }}>&gt;</button>
      </div>
      <div>
        <h1>Relation</h1>
        <h2>Inbound</h2>
        {relation?.getInboundRelationships().map(({ collectionId, data }) => {
          return (
            <div>
              <h3>{collectionId}</h3>
              {JSON.stringify(data)}
            </div>
          )
        })}
        <h2>Outbound</h2>
        {relation?.getOutboundRelationships().map(({ collectionId, data }) => {
          return (
            <div>
              <h3>{collectionId}</h3>
              {JSON.stringify(data)}
            </div>
          )
        })}
        <hr />
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Key</th>
              <th style={{ textAlign: 'center' }}>Value</th>
              <th><button onClick={() => {
                setKeys([...keys, ""]);
                setValues([...values, ""]);
              }}>+</button></th>
            </tr>
          </thead>
          <tbody>

            {((keys, setKeys, values, setValues) => {
              let ret = [];
              for (let i = 0; i < keys.length; i++) {
                ret.push(
                  <tr key={i}>
                    <th><input type="text" onChange={e => {
                      const val = e.target.value;
                      let newKeys = [...keys];
                      newKeys[i] = val;
                      setKeys(newKeys);
                    }} value={keys[i]}></input></th>
                    <th><input type="text" onChange={e => {
                      const val = e.target.value;
                      let newValues = [...values];
                      newValues[i] = val;
                      setValues(newValues);
                    }} value={values[i]}></input></th>
                    <th><button onClick={() => {
                      const dupKeys = [...keys];
                      const dupValues = [...values];
                      dupKeys.splice(i, 1);
                      dupValues.splice(i, 1);
                      setKeys(dupKeys);
                      setValues(dupValues);
                    }}> - </button></th>
                  </tr>
                );
              }
              return ret;
            })(keys, setKeys, values, setValues)}
          </tbody>
        </table>
        <button onClick={() => {
          createObjectFromFormTable();
        }}>submit</button>
      </div>
    </div >
  );
}

export default App;
