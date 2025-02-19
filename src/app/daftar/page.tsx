'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    konfirmasiPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validasi password match
      if (formData.password !== formData.konfirmasiPassword) {
        alert('Password tidak cocok!');
        setLoading(false);
        return;
      }

      // Cek apakah email sudah terdaftar
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.some((user: any) => user.email === formData.email)) {
        alert('Email sudah terdaftar!');
        setLoading(false);
        return;
      }

      // Simpan user baru ke localStorage
      const newUser = {
        email: formData.email,
        username: formData.username,
        password: formData.password
      };

      localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));
      alert('Pendaftaran berhasil!');
      router.push('/masuk');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Terjadi kesalahan saat mendaftar');
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
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/img/logologin.png"
            alt="Signup Logo"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="text-[#1E2A39] text-2xl font-bold">Sign Up</h1>
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
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Username"
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

          <div>
            <input
              type="password"
              id="konfirmasiPassword"
              name="konfirmasiPassword"
              required
              value={formData.konfirmasiPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-[#1E2A39] focus:outline-none bg-transparent"
              placeholder="Konfirmasi Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-30 mx-auto mt-8 flex items-center justify-center space-x-2 bg-[#B5D1E2] text-[#1E2A39] py-2 px-6 rounded-full hover:bg-[#9BBFD3] transition-colors disabled:opacity-50"
          >
            <span>Daftar</span>
            <Image src="/img/masuk.png" alt="Masuk" width={20} height={20} />
          </button>
        </form>
      </div>
    </main>
  );
}