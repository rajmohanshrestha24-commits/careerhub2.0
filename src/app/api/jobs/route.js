import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  const user = getAuthUser(request);

  // verify logged in users
  if (!user) return errorResponse("UNAUTHORIZED!", 401);

  // verify role
  if (user.role !== "EMPLOYER")
    return errorResponse("FORBIDDEN: Employers Only!", 403);

  // yo kaam, verify paxi hunu paro
  const body = await request.json();
  const { title, description, location, salary, company, type } = body;

  // verify values
  if (title === "" || description === "" || location === "" || company === "")
    return errorResponse("Important inputs not filled yet!");

  try {
    // insert values to database -> PostgreSQL
    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary: parseInt(salary),
        company,
        type,
        employerId: user.id,
      },
    });

    return successResponse(newJob, 201);
  } catch (err) {
    return errorResponse(`Error inserting jobs to the database: ${err}`);
  }
}

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const jobs = await prisma.job.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        employer: {
          select: {
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            seekerId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(jobs, 200);
  } catch (err) {
    return errorResponse(`Error tying to fetch jobs: ${err}`);
  }
}
