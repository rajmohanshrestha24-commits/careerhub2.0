import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    return errorResponse("Invalid Params ID", 400);
  }

  const user = getAuthUser(request);

  // Verify logged in user
  if (!user) {
    return errorResponse("UNAUTHORIZED!", 401);
  }

  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        employer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      return errorResponse("Job does not exist!", 404);
    }

    return successResponse(
      {
        message: "Data retrieved successfully!",
        data: job,
      },
      200,
    );
  } catch (err) {
    console.error("Error getting job:", err);

    return errorResponse(
      "Error getting the particular Job",
      500,
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    return errorResponse("Invalid Params ID", 400);
  }

  const user = getAuthUser(request);

  // Verify logged in user
  if (!user) {
    return errorResponse("UNAUTHORIZED!", 401);
  }

  if (user.role !== "EMPLOYER") {
    return errorResponse("FORBIDDEN!", 403);
  }

  try {
    const body = await request.json();

    const existingJob = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        employerId: true,
      },
    });

    if (!existingJob) {
      return errorResponse("Job does not exist!", 404);
    }

    if (existingJob.employerId !== user.id) {
      return errorResponse(
        "FORBIDDEN: Can only update your particular job",
        403,
      );
    }

    const job = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: body,
    });

    return successResponse(
      {
        message: "Job updated successfully!",
        data: job,
      },
      200,
    );
  } catch (err) {
    console.error("Error updating job:", err);

    return errorResponse(
      "Error updating the particular Job",
      500,
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    return errorResponse("Invalid Params ID", 400);
  }

  const user = getAuthUser(request);

  if (!user) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  if (user.role !== "EMPLOYER") {
    return errorResponse("FORBIDDEN", 403);
  }

  try {
    const existingJob = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        employerId: true,
      },
    });

    if (!existingJob) {
      return errorResponse("Job does not exist!", 404);
    }

    if (existingJob.employerId !== user.id) {
      return errorResponse(
        "FORBIDDEN: Can only delete your particular job",
        403,
      );
    }

    const deletedJob = await prisma.job.delete({
      where: {
        id: jobId,
      },
    });

    return successResponse(
      {
        message: "Job deleted successfully",
        data: deletedJob,
      },
      200,
    );
  } catch (err) {
    console.error("Error deleting job:", err);

    return errorResponse(
      "Error deleting the job",
      500,
    );
  }
}