"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchJobs = async (keyword = "") => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `/api/jobs?search=${encodeURIComponent(keyword)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error fetching the job",
        );
      }

      setJobs(data.data);
    } catch (err) {
      console.log("Error caught:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-blue-100 text-blue-800";

      case "INTERNSHIP":
        return "bg-purple-100 text-purple-800";

      case "PART_TIME":
        return "bg-amber-100 text-amber-800";

      case "CONTRACT":
        return "bg-orange-100 text-orange-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApply = (jobId) => {
    router.push(`/jobs/${jobId}/apply`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Jobs
        </h1>

        <p className="text-white">
          Loading jobs...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4 md:items-baseline">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Jobs
          </h1>

          <p className="text-gray-50">
            There are {jobs.length} active jobs actively
            looking for seekers just like you!
          </p>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            className="border-2 border-white rounded-l-lg p-2 text-black"
            placeholder="eg. React Developer"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchJobs(keyword);
              }
            }}
          />

          <button
            className="border-r-2 border-t-2 border-b-2 border-white rounded-r-lg p-2 cursor-pointer text-white"
            onClick={() => {
              fetchJobs(keyword);
            }}
          >
            🔍
          </button>
        </div>
      </div>

      {/* Jobs */}
      <div className="flex flex-col gap-4">
        {jobs.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            <p className="text-lg">
              There are no job listings at the moment
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                {/* Job Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-black">
                      {job.title}
                    </h2>

                    <p className="text-gray-600">
                      {job.company} • {job.location}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                      job.type,
                    )}`}
                  >
                    {job.type.replace("_", " ")}
                  </span>
                </div>

                {/* Job Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">
                      Salary
                    </p>

                    <p className="font-medium text-green-600">
                      {job.salary.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Applications
                    </p>

                    <p className="font-medium text-green-500">
                      {job.applications.length}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Posted
                    </p>

                    <p className="font-medium text-green-500">
                      {new Date(
                        job.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4">
                  {job.description}
                </p>

                {/* Apply */}
                <button
                  onClick={() => handleApply(job.id)}
                  className="px-4 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10"
                >
                  Apply
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;