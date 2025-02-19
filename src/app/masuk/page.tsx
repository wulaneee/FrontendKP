'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ambil data users dari localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Cek credentials
      const user = users.find((u: any) =>
        u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Simpan status login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login berhasil!');
        router.push('/infoanda');
      } else {
        alert('Email atau password salah!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <main className="min-h-screen bg-[#ACC8E5] flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/img/logologin.png"
            alt="Login Logo"
            width={64}
            height={64}
            className="mb-0"
          />
          <h1 className="text-[#1E2A39] text-2xl font-bold -mt-0">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-30 mx-auto mt-8 flex items-center justify-center space-x-2 bg-[#B5D1E2] text-[#1E2A39] py-2 px-4 rounded-full hover:bg-[#9BBFD3] transition-colors disabled:opacity-50"
          >
            <span>Masuk</span>
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