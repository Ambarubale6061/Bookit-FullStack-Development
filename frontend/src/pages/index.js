import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Home() {
  const [exps, setExps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/experiences")
      .then((r) => setExps(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Experiences</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exps.map((e) => (
          <Link
            key={e._id}
            href={`/experiences/${e._id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4"
          >
            <img
              src={e.imageUrl}
              alt={e.title}
              className="h-48 w-full object-cover rounded-md"
            />
            <h2 className="mt-3 text-lg font-semibold text-gray-800">
              {e.title}
            </h2>
            <p className="text-sm text-gray-500">{e.location}</p>
            <div className="mt-2 font-bold text-gray-700">
              ₹{(e.price / 100).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
