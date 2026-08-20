"use client";

import { loginHandler } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleChangeInput = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid login credentials");
        return;
      }

      const token = data.data.token;
      // const userInfo = data.data.userInfo;

      localStorage.setItem("token", token);
      // localStorage.setItem("user", JSON.stringify(userInfo));

      const result = await loginHandler(token);

      if (result?.error) {
        alert(result.error);
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    } catch (err) {
      console.log("Error logging in", err);
      alert(`Error in the login process: ${err.message}`);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 w-[300px] mx-auto mt-10 border p-4 rounded-md shadow-md ">
        <h2 className="text-xl font-bold flex justify-center">Login</h2>
        <p>Email</p>
        <input type="text" name="email" onChange={handleChangeInput} className="border p-2 rounded-md" />
        

        <p>Password</p>
        <input type="password" name="password" onChange={handleChangeInput} className="border p-2 rounded-md" />

        <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded">
          Submit
        </button>
      </div>
    </>
  );
};

export default LoginPage;
