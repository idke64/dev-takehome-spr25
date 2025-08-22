import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { ResponseType } from "@/lib/types/apiResponse";
import { RequestStatus } from "@/lib/types/request";
import {
  requestsIdSchema,
  requestsSchemaWithoutId,
} from "@/lib/validation/requests";
import { createRequest, getRequests, updateRequest } from "@/server/db";
import { z, ZodError } from "zod";

function handleApiError(e: unknown) {
  console.error(e);
  if (e instanceof ZodError) {
    return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
  }
  return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsedData = requestsSchemaWithoutId
      .pick({
        requestorName: true,
        itemRequested: true,
      })
      .parse(body);

    const newRequest = await createRequest({
      ...parsedData,
      createdDate: new Date(),
      lastEditedDate: new Date(),
      status: RequestStatus.PENDING,
    });

    return Response.json(newRequest, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function GET(request: Request) {
  try {
    const querySchema = z.object({
      status: z.nativeEnum(RequestStatus).optional(),
      page: z.coerce.number().default(1),
    });

    const queryParams = Object.fromEntries(new URL(request.url).searchParams);
    const { page, status } = querySchema.parse(queryParams);

    const requests = await getRequests({ page, status });
    return Response.json(requests);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const bodySchema = requestsIdSchema.and(
      requestsSchemaWithoutId.pick({ status: true })
    );
    const { id, status } = bodySchema.parse(await request.json());

    await updateRequest({ id, status });

    return new Response(null, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
