from sqlalchemy import Column, Integer, String
from app.database import Base

class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column("id_categoria", Integer, primary_key=True, index=True)
    nombre = Column("nombre", String(100), nullable=False)
