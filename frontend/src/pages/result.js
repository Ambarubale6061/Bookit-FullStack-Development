import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Result() {
  const router = useRouter();
  const { success, id, msg } = router.query;
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (success === "true" && id) {
      // Normally fetch booking details (skipped for now)
      setBooking({ id });
    }
  }, [success, id]);

  if (success === "true") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-green-700">
          Booking Confirmed 🎉
        </h1>
        <p className="mt-3 text-gray-700">Booking ID: {booking?.id}</p>

        <Link
          href="/"
          className="inline-block mt-6 text-blue-600 hover:text-blue-800 underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold text-red-600">Booking Failed ❌</h1>
      <p className="mt-3 text-gray-700">{msg || "Something went wrong"}</p>

      <Link
        href="/"
        className="inline-block mt-6 text-blue-600 hover:text-blue-800 underline"
      >
        Back to Home
      </Link>
    </div>
  );
}
