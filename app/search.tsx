"use server";

import { createStreamableValue } from "ai/rsc";
import { FirecrawlClient } from "@/lib/firecrawl";
import {
  LangGraphSearchEngine as SearchEngine,
  SearchEvent,
} from "@/lib/langgraph-search-engine";

export async function search(
  query: string,
  context?: { query: string; response: string }[],
  apiKey?: string
) {
  const stream = createStreamableValue<SearchEvent>();

  try {
    // Create FirecrawlClient with API key if provided, fallback to env var
    const effectiveApiKey = apiKey || process.env.FIRECRAWL_API_KEY;

    if (!effectiveApiKey) {
      stream.error(new Error("Firecrawl API key is required"));
      return { stream: stream.value };
    }

    if (!process.env.OPENAI_API_KEY) {
      stream.error(new Error("OpenAI API key is required"));
      return { stream: stream.value };
    }

    const firecrawl = new FirecrawlClient(effectiveApiKey);
    const searchEngine = new SearchEngine(firecrawl);

    // Run search in background with timeout
    const searchPromise = searchEngine.search(
      query,
      (event) => {
        try {
          stream.update(event);
        } catch (error) {
          console.error("Error updating stream:", error);
        }
      },
      context
    );

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Search timeout after 60 seconds")),
        60000
      );
    });

    // Race the search against timeout
    Promise.race([searchPromise, timeoutPromise])
      .then(() => {
        stream.done();
      })
      .catch((error) => {
        console.error("Search error:", error);
        stream.error(error instanceof Error ? error : new Error(String(error)));
      });
  } catch (error) {
    console.error("Search initialization error:", error);
    stream.error(error instanceof Error ? error : new Error(String(error)));
  }

  return { stream: stream.value };
}
