from fastapi import FastAPI

from recommendation.router import router

app = FastAPI(title="Recommendation Module")
app.include_router(router)