import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    return errorResponse("Invalid Job ID", 400);
  }

  const user = getAuthUser(request);

  if (!user) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  if (user.role !== "SEEKER") {
    return errorResponse("FORBIDDEN: Seekers only", 403);
  }

  try {
    const body = await request.json();

    const {
      cvUrl,
      coverLetter,
      yearsOfExperience,
    } = body;

    // Validate fields
    if (
      !cvUrl?.trim() ||
      !coverLetter?.trim() ||
      !yearsOfExperience?.trim()
    ) {
      return errorResponse("Please fill all fields!", 400);
    }

    // Check whether the job exists
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
      },
    });

    if (!job) {
      return errorResponse("Job does not exist!", 404);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        cvUrl: cvUrl.trim(),
        coverLetter: coverLetter.trim(),
        yearsOfExperience: yearsOfExperience.trim(),
        seekerId: user.id,
        jobId: jobId,
      },
    });

    return successResponse(
      {
        message: "Applied to Job Successfully!",
        data: application,
      },
      201,
    );
  } catch (err) {
    // Prisma unique constraint
    if (err.code === "P2002") {
      return errorResponse(
        "You have already applied for this job!",
        409,
      );
    }

    console.error("Application error:", err);

    return errorResponse(
      "Error applying to the job",
      500,
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    return errorResponse("Invalid Job ID", 400);
  }

  const user = getAuthUser(request);

  if (!user) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  if (user.role !== "SEEKER") {
    return errorResponse("FORBIDDEN", 403);
  }

  try {
    const existingApplication =
      await prisma.application.findUnique({
        where: {
          jobId_seekerId: {
            jobId: jobId,
            seekerId: user.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (!existingApplication) {
      return errorResponse(
        "You have yet to apply for the job!",
        404,
      );
    }

    const removedApplication =
      await prisma.application.delete({
        where: {
          id: existingApplication.id,
        },
      });

    return successResponse(
      {
        message: "Application withdrawn successfully!",
        data: removedApplication,
      },
      200,
    );
  } catch (err) {
    console.error("Unapply error:", err);

    return errorResponse(
      "Error withdrawing the application",
      500,
    );
  }
}