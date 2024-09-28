'use client';
import { useState, useEffect, useCallback } from 'react';

export default function Home() {
  const [region, setRegion] = useState('de');
  const [errors, setErrors] = useState('0');
  const [seed, setSeed] = useState('12345');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = useCallback(async (reset = false) => {
    if (isFetching || !hasMore) return;

    try {
      setIsFetching(true);
      const res = await fetch(`/api/generateData?region=${region}&errors=${errors}&seed=${seed}&page=${page}`);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const result = await res.json();

      if (result.data.length > 0) {
        if (reset) {
          setData(result.data);
        } else {
          setData((prevData) => {
            const newData = result.data.filter(item => !prevData.some(prevItem => prevItem.id === item.id));
            return [...prevData, ...newData];
          });
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error.message);
    } finally {
      setIsFetching(false);
    }
  }, [region, errors, seed, page, isFetching, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchData();
    }
  }, [page, fetchData]);

  useEffect(() => {
    if(!isFetching) {
      setPage(1);
      setData([]);
      setHasMore(true);
      fetchData(true);
    }
    
  }, [region, errors, seed]);
  
  useEffect(() => {
    const handleScroll = () => {
      const bottomOfWindow =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      if (bottomOfWindow && !isFetching && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  const handleErrorsInputChange = (e) => {
    const value = e.target.value;
    setErrors(value);
  };

  const handleErrorsSliderChange = (e) => {
    const value = parseFloat(e.target.value).toString();
    setErrors(value);
  };

  useEffect(() => {
    if (parseFloat(errors) < 0) {
      setErrors('0');
    } else if (parseFloat(errors) > 1000) {
      setErrors('1000')
    }
  }, [errors]);

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/exportCSV', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
  
      if (!response.ok) {
        throw new Error(`Error exporting CSV: ${response.status}`);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Fake User Data Generator</h1>
      <div className="mb-4 flex gap-3 items-center">
        <label className="block mb-2">Region</label>
        <select
          className="border border-gray-300 p-2 mb-4"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="de">Germany</option>
          <option value="pl">Poland</option>
          <option value="uz">Uzbekistan</option>
        </select>

        <label className="block mb-2">Errors</label>
        <input
          type="text"
          value={errors}
          onChange={handleErrorsInputChange}
          className="border border-gray-300 p-2 mb-4 w-full"
        />
        <input
          type="range"
          min="0"
          max="10"
          step="0.25"
          value={parseFloat(errors)}
          onChange={handleErrorsSliderChange}
          className="w-full mb-4"
        />

        <label className="block mb-2">Seed</label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="border border-gray-300 p-2 mb-4 w-full"
        />
        <button
          onClick={() => setSeed(Math.random().toString(36).slice(2, 11))}
          className="bg-blue-500 text-white p-2"
        >
          Random Seed
        </button>
      </div>
      <table className="table-fixed w-[100%] border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="text-center">
              <td className=" overflow-hidden text-ellipsis whitespace-nowrap border px-4 py-2">{index + 1}</td>
              <td className="overflow-hidden text-ellipsis whitespace-nowrap border px-4 py-2">{item.id}</td>
              <td className="overflow-hidden text-ellipsis whitespace-nowrap border px-4 py-2">{item.fullName}</td>
              <td className="overflow-hidden text-ellipsis whitespace-nowrap border px-4 py-2">{item.address}</td>
              <td className="overflow-hidden text-ellipsis whitespace-nowrap border px-4 py-2">{item.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isFetching && <h4 className="mt-4">Loading...</h4>}
      <div className=' sticky b-[10px] z-10'>
        <button
          onClick={handleExportCSV}
          className="fixed bottom-4 right-4 bg-green-500 text-white p-2">
          Export to CSV
        </button>
      </div>
    </div>
  );
}
