import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { arr } from './mockdata';

function App() {
  const [data, setData] = useState([]);

  const fetchBatchData = async (batch) => {
    const requests = batch.map(partNumber =>
      axios.get(`https://productselector-api.vostermans.com/rest/products?filter[0][property]=partNumber&filter[0][operator]=eq&filter[0][value]=${partNumber}&limit=1&offset=0`)
    );
    const responses = await Promise.all(requests);
    return responses.map(response => response.data);
  };

  const fetchAllData = async () => {
    try {
      const batchSize = 15; // Number of requests per batch
      const delay = 5000; // Delay between batches in milliseconds
      let results = [];

      for (let i = 0; i < arr.length; i += batchSize) {
        const batch = arr.slice(i, i + batchSize);
        const batchData = await fetchBatchData(batch);
        // Add undefined for empty links
        const processedBatchData = batchData.map(item => {
          if (item.length === 0) {
            return {id: i, part_number: 'undefined'};
          }
          return item;
        });
        results = [...results, ...processedBatchData];
        setData(results); // Update state with current results
        await new Promise(resolve => setTimeout(resolve, delay)); // Delay before next batch
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleDownload = () => fetchAllData();

  let resss = data.flatMap(items => items);
  console.log(resss);

  return (
    <div className="container">
      <button className='btn' onClick={handleDownload}>Click</button>
      <div className="item_block">
        {resss?.map((item, index) => (
          <div key={index} className="block">
            {item ? (
              <>
                <h1 className="name">{`Vostermans ${item.name} ${item.popular_diameter_metric} cm ${item.power_consumption_metric} W ${item.part_number}`}</h1>
                <p>{item.part_number}</p>
                <div className="img_cont">
                  {item.documents?.map((doc, docIndex) => {
                    if (doc?.url) {
                      if (doc.url.includes('jpg') || doc.url.includes('png')) {
                        return <img className="img" src={doc.url} key={docIndex} alt={`Image ${docIndex}`} />;
                      } else if (doc.url.includes('pdf')) {
                        return <p className="pdf" key={docIndex}>{doc.url}</p>;
                      }
                    }
                    return null;
                  })}
                </div>
                <p className="desc">{`${item.short_description}. ${item.long_description}`}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
