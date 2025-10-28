import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/router';

export default function Checkout(){
  const router = useRouter();
  const [data, setData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [promo, setPromo] = useState('');
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(()=>{
    const raw = localStorage.getItem('bookit_selected');
    if (!raw) { router.push('/'); return; }
    const parsed = JSON.parse(raw);
    setData(parsed);
    setQuantity(parsed.quantity || 1);
  }, []);

  if (!data) return <div className="container">Loading...</div>;

  const slot = data.slot;
  const exp = data.exp;
  const basePrice = (exp.price + (slot.priceAdjust||0)) / 100;
  const total = basePrice * quantity;

  const handleSubmit = async () => {
    if (!name || !email) { alert('Please fill name & email'); return; }
    setLoading(true);
    try {
      // validate promo (optional)
      const promoRes = await api.post('/api/promo/validate', { code: promo });
      const res = await api.post('/api/bookings', {
        slotId: slot._id,
        name, email, phone, quantity, promoCode: promo
      });
      if (res.data.success) {
        localStorage.removeItem('bookit_selected');
        router.push('/result?success=true&id=' + res.data.booking._id);
      } else {
        router.push('/result?success=false&msg=' + encodeURIComponent(res.data.error||''));
      }
    } catch (err) {
      router.push('/result?success=false&msg=' + encodeURIComponent(err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-4">
        <div className="bg-white p-4 rounded shadow">
          <div><strong>{exp.title}</strong></div>
          <div>Slot: {new Date(slot.date).toLocaleString()}</div>
          <div>Price per person: ₹{basePrice}</div>
          <div className="mt-2">
            <label className="block">Quantity</label>
            <input type="number" min="1" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="p-2 border rounded w-32" />
          </div>
        </div>
        <div className="mt-4 bg-white p-4 rounded shadow">
          <label className="block">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="p-2 border rounded w-full" />
          <label className="block mt-2">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="p-2 border rounded w-full" />
          <label className="block mt-2">Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="p-2 border rounded w-full" />
          <label className="block mt-2">Promo Code</label>
          <input value={promo} onChange={e=>setPromo(e.target.value)} className="p-2 border rounded w-full" />

          <div className="mt-4">
            <div className="font-semibold">Total: ₹{(total).toFixed(0)}</div>
            <button onClick={handleSubmit} disabled={loading} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
              {loading?'Processing...':'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
