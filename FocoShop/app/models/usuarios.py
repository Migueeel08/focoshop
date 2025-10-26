from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)  # ✅ Nuevo campo
    imagen = Column(String(255), nullable=True)   # ✅ Nuevo campo para la foto
    rol = Column(String(20), nullable=False, default="user")
    fecha_registro = Column(DateTime, server_default=func.now())
