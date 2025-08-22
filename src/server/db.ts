import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";
import { RequestStatus } from "@/lib/types/request";
import {
  NormalizedRequest,
  RequestNoId,
  requestsSchema,
} from "@/lib/validation/requests";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { z } from "zod";

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "crisis_compass";
const COLLECTION_NAME = "requests";

let client: MongoClient;
let db: Db;
let requestsCollection: Collection;

async function connectToDb() {
  if (client) {
    return { db, requestsCollection };
  }
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  client = await MongoClient.connect(MONGO_URI);
  db = client.db(DB_NAME);
  requestsCollection = db.collection(COLLECTION_NAME);
  console.log("Established new connection to MongoDB.");
  return { db, requestsCollection };
}

export async function createRequest(
  request: RequestNoId
): Promise<NormalizedRequest> {
  const { requestsCollection } = await connectToDb();
  const { insertedId } = await requestsCollection.insertOne(request);

  const createdRequest = { ...request, _id: insertedId };
  return requestsSchema.parse(createdRequest);
}

export async function getRequests({
  page,
  status,
}: {
  page: number;
  status?: RequestStatus;
}): Promise<NormalizedRequest[]> {
  const { requestsCollection } = await connectToDb();
  const filter = status ? { status } : {};

  const data = await requestsCollection
    .find(filter)
    .sort({ createdDate: -1 })
    .skip((page - 1) * PAGINATION_PAGE_SIZE)
    .limit(PAGINATION_PAGE_SIZE)
    .toArray();

  return z.array(requestsSchema).parse(data);
}

export async function updateRequest({
  id,
  status,
}: Pick<NormalizedRequest, "id" | "status">): Promise<boolean> {
  const { requestsCollection } = await connectToDb();
  const result = await requestsCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        lastEditedDate: new Date(),
      },
    }
  );

  return result.modifiedCount === 1;
}
