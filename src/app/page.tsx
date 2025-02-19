'use client';

import Image from 'next/image';
import Link from 'next/link'; // Tambahkan import Link
import { motion } from 'framer-motion';
import { useEffect } from 'react'; // 
import { useRouter } from 'next/navigation'; 

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Cek jika user masih login, arahkan ke chatbot
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      router.push('/chatbot');
    }
  }, [router]);
  
  return (
    <main className="min-h-screen bg-[#ACC8E5] relative overflow-hidden flex items-center justify-center">
      {/* Logo */}
      <div className="absolute top-14 left-8">
        <Image
          src="/img/logo.png"
          alt="Healthcare Logo"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Text Content */}
        <div className="md:w-1/2 space-y-2 z-7">
          <h1 className="text-[#112A46] text-4xl md:text-5xl font-poppins italic">
            Sedang Sakit?
          </h1>
          <h2 className="text-[#112A46] text-3xl md:text-4xl font-poppins italic">
            Ayo segera
          </h2>
          <h2 className="text-[#112A46] text-3xl md:text-4xl font-poppins italic">
            Konsultasi
          </h2>
          <p className="text-[#4A5567] text-lg font-poppins mb-20">
            konsultasi sehat tercepat, kapan saja dan dimana saja
          </p>
          
          {/* Buttons - Menggunakan Link */}
          <div className="flex space-x-12 pt-12 ">
            <Link href="/masuk">
              <button className="bg-[#112A46] text-white px-8 py-2 rounded-lg hover:bg-[#2c3e50] transition-colors">
                Masuk
              </button>
            </Link>
            <Link href="/daftar">
              <button className="bg-white text-[#112A46] px-8 py-2 rounded-lg border border-[#ededef] hover:bg-gray-50 transition-colors">
                Daftar
              </button>
            </Link>
          </div>
        </div>

        {/* Doctors Images */}
        <div className="md:w-1/2 relative h-[400px] mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute right-20 top-5"
          >
            <Image
              src="/img/doctor1.png"
              alt="Doctor 1"
              width={400}
              height={300}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute right-25 top-0"
          >
            <Image
              src="/img/doctor2.png"
              alt="Doctor 2"
              width={300}
              height={400}
              className="object-contain"
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}