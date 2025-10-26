from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 🔹 Modelo para crear usuario (registro)
class UserCreate(BaseModel):
    nombre: str
    apellido: Optional[str] = None
    email: EmailStr
    password: str  # Debe coincidir con lo que envía Angular

    model_config = {"populate_by_name": True}  # Pydantic v2

# 🔹 Modelo para salida de usuario
class UserOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido: Optional[str] = None
    email: EmailStr
    telefono: Optional[str] = None
    imagen: Optional[str] = None
    rol: Optional[str] = "user"
    fecha_registro: Optional[datetime] = None

    model_config = {"from_attributes": True}

# 🔹 Modelo para token de autenticación
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 🔹 Modelo para datos del token
class TokenData(BaseModel):
    username: Optional[str] = None
