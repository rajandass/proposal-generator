import os
import json
from models.proposal import ProposalContent

AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")

SYSTEM_PROMPT = """You are a professional proposal writer for software development projects.
Generate a complete, high-quality web development proposal in JSON format.

The JSON must match this exact structure:
{
  "executive_summary": "string - 2-3 paragraphs covering the client's problem and your proposed solution",
  "scope_of_work": {
    "deliverables": ["list of specific deliverables"],
    "resources": ["list of resources/team members needed"]
  },
  "timeline": [
    {"phase": "phase name", "duration": "duration string e.g. '2 weeks'"}
  ],
  "expenditure": [
    {"description": "line item name", "cost": number, "tax_rate": 0.18}
  ],
  "about_us": "string - 1-2 paragraphs about the company",
  "contact": {
    "company": "string",
    "address": "string",
    "phone": "string",
    "email": "string"
  }
}

Write in a professional, confident tone. Be specific about deliverables and timelines.
Return ONLY valid JSON — no markdown, no explanation."""


async def generate_proposal(brief: str, context: dict) -> ProposalContent:
    if AI_PROVIDER == "anthropic":
        return await _generate_anthropic(brief, context)
    return await _generate_openai(brief, context)


async def _generate_openai(brief: str, context: dict) -> ProposalContent:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    user_message = f"""Generate a proposal for this project:

Client: {context.get('client_name')}
Project Budget: ${context.get('price'):,.2f}
Company: {context.get('company_name', 'Our Company')}
About Company: {context.get('about_blurb', '')}
Contact: {context.get('contact', {})}

Project Brief:
{brief}"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    content_dict = json.loads(response.choices[0].message.content)
    return ProposalContent(**content_dict)


async def _generate_anthropic(brief: str, context: dict) -> ProposalContent:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    user_message = f"""Generate a proposal for this project:

Client: {context.get('client_name')}
Project Budget: ${context.get('price'):,.2f}
Company: {context.get('company_name', 'Our Company')}
About Company: {context.get('about_blurb', '')}
Contact: {context.get('contact', {})}

Project Brief:
{brief}"""

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )

    content_dict = json.loads(message.content[0].text)
    return ProposalContent(**content_dict)
