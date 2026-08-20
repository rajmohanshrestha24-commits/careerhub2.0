"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: 0,
    type: "FULL_TIME",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Retrieve your stored JWT from local storage (or whatever state client auth uses)
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass Auth Header
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Success! Send user to jobs feed
      router.push("/jobs");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Post a New Job (Employer Portal)
      </h2>

      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>⚠️ {error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Job Title *
          </label>
          <input
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. React Developer"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Company *
            </label>
            <input
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Stripe"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Location *
            </label>
            <input
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote"
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Salary (Optional)
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g.  रु 15,00,000 / yr"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Job Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Description *
          </label>
          <textarea
            name="description"
            required
            rows="6"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe responsibilities..."
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10 cursor-pointer`}
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};
// const buttonStyle = {
//   backgroundColor: "#0070f3",
//   color: "white",
//   padding: "12px",
//   border: "none",
//   borderRadius: "6px",
//   cursor: "pointer",
//   fontWeight: "bold",
// };
