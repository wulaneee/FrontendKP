"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function InfoAnda() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({
    usia: "",
    bb: "",
    tb: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cek status login
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = localStorage.getItem("currentUser");

    if (!isLoggedIn || !currentUser) {
      router.push("/masuk");
      return;
    }

    // Set username dari data login
    const user = JSON.parse(currentUser);
    setUsername(user.username);

    // Cek apakah sudah ada data infoAnda
    const savedInfo = localStorage.getItem(`infoAnda_${user.email}`);
    if (savedInfo) {
      setFormData(JSON.parse(savedInfo));
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      // Simpan data ke localStorage
      localStorage.setItem(
        `infoAnda_${currentUser.email}`,
        JSON.stringify(formData)
      );

      // Redirect ke halaman chatbot (ubah dari /konsultasi ke /chatbot)
      router.push("/chatbot");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-[#ACC8E5] flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/img/logologin.png"
            alt="User Icon"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="text-[#112A46] text-2xl font-bold text-center">
            Hai, {username}!
          </h1>
          <h2 className="text-[#112A46] text-xl font-semibold mt-2">
            info anda
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            Usia Anda (tahun):
            <input
              type="number"
              id="usia"
              name="usia"
              required
              value={formData.usia}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Usia"
            />
          </div>

          <div>
            Berat Badan (kg):
            <input
              type="number"
              id="bb"
              name="bb"
              required
              value={formData.bb}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Bb"
            />
          </div>

          <div>
            Tinggi Badan (cm):
            <input
              type="number"
              id="tb"
              name="tb"
              required
              value={formData.tb}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Tb"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-38 mx-auto mt-8 flex items-center justify-center space-x-2 bg-[#ACC8E5] text-[#112A46] py-2 px-6 rounded-full hover:bg-[#9BBFD3] transition-colors disabled:opacity-50"
          >
            <span>Mulai Konsultasi</span>
            <Image
              src="/img/masuk.png"
              alt="Masuk icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </button>
        </form>
      </div>
    </main>
  );
}
