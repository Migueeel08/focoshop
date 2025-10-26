from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.categorias import CategoriaCreate, CategoriaOut
from app.crud.categorias import get_categorias, get_categoria, create_categoria
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=list[CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return get_categorias(db)

@router.get("/{categoria_id}", response_model=CategoriaOut)
def leer_categoria_router(categoria_id: int, db: Session = Depends(get_db)):
    cat = get_categoria(db, categoria_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return cat

@router.post("/", response_model=CategoriaOut)
def crear_categoria_router(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    return create_categoria(db, categoria)
