from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Body, Form
from sqlalchemy.orm import Session
from app.schemas.usuarios import UserCreate, UserOut, Token
from app.auth import authenticate_user, create_access_token, get_db
from app.crud import usuarios as crud
from datetime import datetime
import os

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

UPLOAD_DIR = "uploads/perfiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -----------------------------
# Registro de usuario (JSON)
# -----------------------------
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(
        user: UserCreate,
        db: Session = Depends(get_db)
):
    """
    Registro de usuario con JSON.
    Ruta: POST /usuarios/register
    """
    # Verificar si el email ya existe
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear usuario
    return crud.create_user(db, user)


# -----------------------------
# Login
# -----------------------------
@router.post("/token", response_model=Token)
def login_for_access_token(
        username: str = Form(...),
        password: str = Form(...),
        db: Session = Depends(get_db)
):
    """
    Login de usuario.
    Ruta: POST /usuarios/token
    """
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# -----------------------------
# Obtener usuario por email
# -----------------------------
@router.get("/email/{email}", response_model=UserOut)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """
    Obtener usuario por email.
    Ruta: GET /usuarios/email/{email}
    """
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user


# -----------------------------
# Obtener usuario por ID
# -----------------------------
@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """
    Obtener usuario por ID.
    Ruta: GET /usuarios/{user_id}
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user


# -----------------------------
# Actualizar usuario
# -----------------------------
@router.put("/{user_id}", response_model=UserOut)
def update_user(
        user_id: int,
        user_data: dict = Body(...),
        db: Session = Depends(get_db)
):
    """
    Actualizar datos de usuario.
    Ruta: PUT /usuarios/{user_id}
    """
    db_user = crud.update_user(db, user_id, user_data)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return db_user


# -----------------------------
# Subir o actualizar foto de perfil
# -----------------------------
@router.post("/{user_id}/foto")
def subir_foto_perfil(
        user_id: int,
        foto: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    """
    Subir foto de perfil.
    Ruta: POST /usuarios/{user_id}/foto
    """
    # Verificar que el usuario existe
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Validar tipo de archivo
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = os.path.splitext(foto.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagen no permitido. Use: jpg, jpeg, png, gif, webp"
        )

    # Crear directorio si no existe
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generar nombre único para el archivo
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    filename = f"user_{user_id}_{timestamp}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Guardar archivo
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(foto.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la imagen: {str(e)}"
        )

    # Actualizar ruta en la base de datos
    relative_path = f"/uploads/perfiles/{filename}"
    db_user = crud.update_user_image(db, user_id, relative_path)

    return {
        "message": "Foto subida correctamente",
        "foto_url": relative_path
    }


# -----------------------------
# Eliminar usuario
# -----------------------------
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Eliminar usuario.
    Ruta: DELETE /usuarios/{user_id}
    """
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return None