from pydantic import BaseModel


class GenerateDslRequest(BaseModel):
    prompt: str
    notation: str


class GenerateDslResponse(BaseModel):
    dsl_code: str
