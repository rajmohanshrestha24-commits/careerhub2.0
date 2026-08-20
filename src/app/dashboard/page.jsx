"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const jsonData = await res.json();
      setJobs(jsonData.data.data);
    } catch (err) {
      console.log("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (appId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:3000/api/dashboard/application",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "PATCH",
          "Content-Type": "application/json",
          body: JSON.stringify({ appId, status }),
        },
      );

      if (!res.ok) throw new Error("Unexpected Error!");

      const dataJson = await res.json();
      console.log("Application status changed: ", dataJson);
      await fetchJobs();
    } catch (err) {
      console.log("Error in Application change process", err);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  const totalApplications = jobs.reduce(
    (sum, job) => sum + job.applications.length,
    0,
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-8 flex justify-between items-baseline">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Employer Dashboard
          </h1>
          <p className="text-gray-50">
            You have {jobs.length} active jobs, {totalApplications} total
            applications
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/new"
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10`}
          >
            CREATE JOB
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {jobs.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            <p className="text-lg">
              You have yet to upload any jobs at the moment
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Job Header */}
              <div className="p-6">
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Salary</p>
                    <p className="font-medium text-green-600">
                      {job.salary.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Applications</p>
                    <p className="font-medium text-green-500">
                      {job.applications.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Posted</p>
                    <p className="font-medium text-green-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{job.description}</p>

                <button
                  onClick={() => toggleExpand(job.id)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                >
                  {expandedJobId === job.id
                    ? "Hide Applications"
                    : `View (${job.applications.length} Applications)`}
                </button>
              </div>

              {/* Applications Section */}
              {expandedJobId === job.id && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="p-6">
                    <h3 className="font-medium mb-4 text-black">
                      Applications
                    </h3>

                    {job.applications.length === 0 ? (
                      <p className="text-gray-900 text-center py-6">
                        This job has yet to have any applications
                      </p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {job.applications.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white rounded-lg border border-gray-200 p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {app.seeker.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {app.seeker.email}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  app.status,
                                )}`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div>
                                <p className="text-gray-500">
                                  Years of Experience
                                </p>
                                <p className="text-green-500">
                                  {app.yearsOfExperience}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Applied On</p>
                                <p className="text-green-500">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3 items-center flex-wrap">
                              <a
                                href={app.cvUrl}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View CV
                              </a>
                              <p className="text-sm text-green-500">
                                {app.coverLetter}
                              </p>
                              <label className="text-sm text-gray-600 ml-auto">
                                Update Status:
                              </label>
                              <select
                                name="status"
                                value={app.status}
                                onChange={(e) => {
                                  handleStatusChange(app.id, e.target.value);
                                }}
                                className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-${getStatusColor(app.status)}`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="DECLINED">Declined</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
