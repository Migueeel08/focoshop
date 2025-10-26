from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.routers import usuarios, categorias
import socket
import os

# 🔹 Crear tablas
Base.metadata.create_all(bind=engine)

# 🔹 Inicializar FastAPI
app = FastAPI(title="FocoShop API")

# 🔹 Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Origen Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Carpeta de uploads para servir imágenes
UPLOAD_DIR = "uploads/perfiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 🔹 Routers
app.include_router(usuarios.router, prefix="", tags=["Usuarios"])
app.include_router(categorias.router, prefix="", tags=["Categorías"])

# 🔹 Endpoint de prueba
@app.get("/")
def index():
    return {"status": "Backend funcionando", "ruta": "http://localhost:8000"}

# 🔹 Ejecutar FastAPI con uvicorn
if __name__ == "__main__":
    import uvicorn
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"FastAPI corriendo en la IP: {local_ip}, puerto 8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
