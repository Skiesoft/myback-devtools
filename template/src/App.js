import React, { useEffect, useState } from "react";
import "./App.css";
import SDK from 'myback-sdk';

function App() {
  const sdk = new SDK();
  const [collections, setCollections] = useState();
  const [workingCollection, setWorkingCollection] = useState();
  const [objects, setObjects] = useState();

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
      const response = await workingCollection?.getPage();
      setObjects(response);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, [workingCollection]);

  return (
    <div className="App">
      {collections?.map((collection, index) => <h1 key={index}>{collection.collectionId}</h1>)}
      <input type='text' onChange={e => setWorkingCollection(collections?.find(v => v.collectionId == e.target.value))}></input>
      {objects?.map((object, index) => <div key={index}>
        {((obj) => {
          let ret = [];
          let i = 0;
          for (const [key, value] of Object.entries(obj.properties)) {
            ret.push(<div key={i++}>{value}</div>)
          }
          return ret;
        })(object)}
      </div>)}
    </div>
  );
}

export default App;
