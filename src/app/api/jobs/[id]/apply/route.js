import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  const body = await request.json();
  const { cvUrl, coverLetter, yearsOfExperience } = body;

  // verify fields
  if (cvUrl === "" || coverLetter === "" || yearsOfExperience === "")
    return errorResponse("Please fill all fields!", 400);

  try {
    const application = await prisma.application.create({
      data: {
        cvUrl,
        coverLetter,
        yearsOfExperience,
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
    if (err.code === "P2002")
      return errorResponse({
        message: "You have already applied for this job!",
        error: err,
      });
    return errorResponse({ message: "Error applying to the job", error: err });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  try {
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId,
          seekerId: user.id,
        },
      },
      select: { id: true },
    });

    console.log("Existing Application: ", existingApplication);

    if (!existingApplication)
      return errorResponse(
        { message: "You have yet to apply for the job!" },
        404,
      );

    const removedApplication = await prisma.application.delete({
      where: {
        id: existingApplication.id,
      },
    });

    return successResponse(removedApplication, 404);
  } catch (err) {
    return errorResponse({
      message: "Error Unapplying to the job",
      error: err,
    });
  }
}
