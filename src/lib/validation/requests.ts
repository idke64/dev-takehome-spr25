import { z } from "zod";
import { RequestStatus } from "../types/request";
import { ObjectId } from "mongodb";

export const requestsSchemaWithoutId = z.object({
  requestorName: z.string().min(3).max(30),
  itemRequested: z.string().min(2).max(100),
  createdDate: z.coerce.date(),
  lastEditedDate: z.coerce.date().optional(),
  status: z.nativeEnum(RequestStatus),
});

export const requestsIdSchema = z
  .object({ id: z.string() })
  .or(z.object({ _id: z.instanceof(ObjectId) }))
  .transform((it) => ("id" in it ? it : { id: it._id.toString() }));

export const requestsSchema = requestsSchemaWithoutId.and(requestsIdSchema);

export type NormalizedRequest = z.output<typeof requestsSchema>;
export type RequestNoId = z.input<typeof requestsSchemaWithoutId>;
