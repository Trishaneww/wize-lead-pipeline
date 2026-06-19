// Libs
import Anthropic from "@anthropic-ai/sdk";
import { anthropic as client } from "@/lib/clients/anthropic";
import { AnthropicError } from "@/lib/errors";

type BatchRequest = Anthropic.Messages.Batches.BatchCreateParams.Request;
type BatchResult = Anthropic.Messages.Batches.MessageBatchResult;

export async function submitBatch(requests: BatchRequest[]): Promise<string> {
  try {
    const batch = await client.messages.batches.create({ requests });
    return batch.id;
  } catch (cause) {
    throw new AnthropicError("Failed to submit Anthropic batch", { cause });
  }
}

export async function getBatchStatus(batchId: string): Promise<{
  status: Anthropic.Messages.Batches.MessageBatch["processing_status"];
  counts: Anthropic.Messages.Batches.MessageBatchRequestCounts;
}> {
  const batch = await client.messages.batches.retrieve(batchId);
  return { status: batch.processing_status, counts: batch.request_counts };
}

export async function collectBatchResults(
  batchId: string,
): Promise<{ customId: string; result: BatchResult }[]> {
  const out: { customId: string; result: BatchResult }[] = [];
  for await (const entry of await client.messages.batches.results(batchId)) {
    out.push({ customId: entry.custom_id, result: entry.result });
  }
  return out;
}
