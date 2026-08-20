"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.id;

  const [formData, setFormData] = useState({
    cvUrl: "",
    coverLetter: "",
    yearsOfExperience: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "You must be logged in to apply for a job.",
      );

      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/apply`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to submit application",
        );
      }

      setSuccess(
        "Application submitted successfully!",
      );

      setFormData({
        cvUrl: "",
        coverLetter: "",
        yearsOfExperience: "",
      });

      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while applying.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-black mb-2">
          Apply for Job
        </h1>

        <p className="text-gray-600 mb-6">
          Complete the form below to submit your
          application.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {/* CV */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">
              CV URL *
            </label>

            <input
              type="url"
              name="cvUrl"
              required
              value={formData.cvUrl}
              onChange={handleChange}
              placeholder="https://example.com/my-cv.pdf"
              className="w-full border border-gray-300 rounded-lg p-3 text-black"
            />

            <p className="text-sm text-gray-500 mt-1">
              Provide a link to your CV.
            </p>
          </div>

          {/* Experience */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">
              Years of Experience *
            </label>

            <input
              type="text"
              name="yearsOfExperience"
              required
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="e.g. 2 years"
              className="w-full border border-gray-300 rounded-lg p-3 text-black"
            />
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">
              Cover Letter *
            </label>

            <textarea
              name="coverLetter"
              required
              rows={8}
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Write a short cover letter explaining why you are suitable for this job..."
              className="w-full border border-gray-300 rounded-lg p-3 text-black resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg font-medium bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}