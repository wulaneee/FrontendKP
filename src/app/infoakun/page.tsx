"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserData {
  username: string;
  email: string;
  usia: string;
  tb: string;
  bb: string;
}

export default function InfoAkun() {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    usia: "",
    tb: "",
    bb: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    // Load user data from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userInfo = JSON.parse(
      localStorage.getItem(`infoAnda_${currentUser.email}`) || "{}"
    );

    setUserData({
      username: currentUser.username || "",
      email: currentUser.email || "",
      usia: userInfo.usia || "",
      tb: userInfo.tb || "",
      bb: userInfo.bb || "",
    });
  }, []);

  const handleSave = () => {
    try {
      // Validasi password baru jika diisi
      if (passwords.new || passwords.confirm) {
        if (passwords.new !== passwords.confirm) {
          alert("Password baru dan konfirmasi password tidak cocok!");
          return;
        }
      }

      // Update data user di localStorage
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      const updatedUser = {
        ...currentUser,
        username: userData.username,
        email: userData.email,
      };

      // Update password jika ada perubahan
      if (passwords.new) {
        updatedUser.password = passwords.new;
      }

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Update info tambahan user
      const userInfo = {
        usia: userData.usia,
        tb: userData.tb,
        bb: userData.bb,
      };
      localStorage.setItem(
        `infoAnda_${userData.email}`,
        JSON.stringify(userInfo)
      );

      alert("Data berhasil disimpan!");
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <Image src="/img/history.png" alt="Back" width={30} height={30} />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2"
          >
            <Image src="/img/logologin.png" alt="User" width={32} height={32} />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full">
                <Image
                  src="/img/akun.png"
                  alt="Account"
                  width={20}
                  height={20}
                />
                <span>Akun saya</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full"
              >
                <Image src="/img/out.png" alt="Logout" width={20} height={20} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto p-0">
        <h1 className="text-2xl font-semibold text-[#112A46] mb-3">
          Edit Informasi Akun
        </h1>

        <div className="space-y-1">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
              className="w-full max-w-sm p-2 border bg-gray-100 rounded-lg"
              readOnly
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              className="w-full max-w-sm p-2 border bg-gray-100 rounded-lg"
              readOnly
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Ganti password</label>
            <input
              type="password"
              placeholder="password sekarang"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              className="w-full max-w-sm p-2 border bg-gray-100 rounded-lg mb-2"
            />
            <input
              type="password"
              placeholder="Password baru"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              className="w-full max-w-sm p-2 border bg-gray-100 rounded-lg mb-2"
            />
            <input
              type="password"
              placeholder="Konfirmasi password baru"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full max-w-sm p-2 border bg-gray-100 rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="text-gray-700 mr-2">Usia</label>
                <div className="flex items-center bg-gray-100 rounded-lg border">
                  <input
                    type="text"
                    value={userData.usia}
                    onChange={(e) =>
                      setUserData({ ...userData, usia: e.target.value })
                    }
                    className="w-12 p-2 bg-transparent outline-none"
                  />
                  <span className="pr-2 text-gray-500">th</span>
                </div>
              </div>

              <div className="flex items-center">
                <label className="text-gray-700 mr-2">Tb</label>
                <div className="flex items-center bg-gray-100 rounded-lg border">
                  <input
                    type="text"
                    value={userData.tb}
                    onChange={(e) =>
                      setUserData({ ...userData, tb: e.target.value })
                    }
                    className="w-12 p-2 bg-transparent outline-none"
                  />
                  <span className="pr-2 text-gray-500">cm</span>
                </div>
              </div>

              <div className="flex items-center">
                <label className="text-gray-700 mr-2">Bb</label>
                <div className="flex items-center bg-gray-100 rounded-lg border">
                  <input
                    type="text"
                    value={userData.bb}
                    onChange={(e) =>
                      setUserData({ ...userData, bb: e.target.value })
                    }
                    className="w-12 p-2 bg-transparent outline-none"
                  />
                  <span className="pr-2 text-gray-500">kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-8">
            <Link href="/doctor/chatbot">
              <button className="px-6 py-2 bg-[#112A46] text-white rounded-lg hover:bg-opacity-90">
                Saya seorang dokter
              </button>
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-[#112A46] text-white rounded-lg hover:bg-opacity-90"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#ACC8E5] text-[#FFFCFC] rounded-lg hover:bg-opacity-90"
            >
              Simpan perubahan
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
