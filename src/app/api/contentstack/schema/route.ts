import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { CONTENTSTACK_API_KEY, CONTENTSTACK_MANAGEMENT_TOKEN, CONTENTSTACK_AGENT_CT_UID, CONTENTSTACK_REGION } =
      process.env;
    const apiHost = CONTENTSTACK_REGION === "eu" ? "https://eu-api.contentstack.com" : "https://api.contentstack.io";
    const response = await fetch(
      `${apiHost}/v3/content_types/${CONTENTSTACK_AGENT_CT_UID}?include_global_field_schema=true`,
      {
        method: "GET",
        headers: {
          api_key: CONTENTSTACK_API_KEY!,
          authorization: CONTENTSTACK_MANAGEMENT_TOKEN!,
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_message || "Failed to fetch Contentstack schema.");
    }
    const data = await response.json();
    const schema = data.content_type.schema;
    const providerField = schema.find((field: { uid: string }) => field.uid === "provider");
    const modelField = schema.find((field: { uid: string }) => field.uid === "model_name");
    const providerChoices = providerField?.enum?.choices || [];
    const modelChoices = modelField?.enum?.choices || [];
    return NextResponse.json({
      success: true,
      providers: providerChoices.map((c: { value: string }) => c.value),
      models: modelChoices.map((c: { value: string }) => c.value)
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
