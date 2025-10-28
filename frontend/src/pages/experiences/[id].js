import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import Link from "next/link";

export default function Details() {
  const router = useRouter();
  const { id } = router.query;
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/api/experiences/${id}`)
      .then((r) => setExp(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!exp) return <div className="container">Not found</div>;

  return (
    <div className="container">
      {/* ✅ Fixed: removed <a> tag inside Link */}
      <Link href="/" className="text-blue-600">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold mt-2">{exp.title}</h1>
      <p className="text-gray-700 mt-2">{exp.description}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Slots</h3>
        <div className="space-y-2 mt-2">
          {exp.slots.map((s) => {
            const available = s.capacity - s.bookedCount;
            return (
              <div
                key={s._id}
                className="p-3 bg-white rounded shadow flex justify-between items-center"
              >
                <div>
                  <div>{new Date(s.date).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    Available: {available}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 p-1 border rounded"
                  />
                  <button
                    onClick={() => {
                      setSelectedSlot(s);
                      // pass via localStorage and go to checkout
                      localStorage.setItem(
                        "bookit_selected",
                        JSON.stringify({ exp, slot: s, quantity })
                      );
                      window.location.href = "/checkout";
                    }}
                    disabled={available <= 0}
                    className={`px-3 py-1 rounded ${
                      available > 0 ? "bg-blue-600 text-white" : "bg-gray-300"
                    }`}
                  >
                    Select
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
