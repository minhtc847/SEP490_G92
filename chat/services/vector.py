from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain.vectorstores import VectorStore
from langchain_core.documents import Document
from openai import OpenAI
import os
import pandas as pd


client = OpenAI()
def get_embedding(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    return client.embeddings.create(input = [text], model=model).data[0].embedding