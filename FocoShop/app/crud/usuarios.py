from sqlalchemy.orm import Session
from app.models.usuarios import Usuario
from app.schemas.usuarios import UserCreate
from passlib.context import CryptContext
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ========================================
# 🔹 Funciones de contraseña
# ========================================
def hash_password(password: str) -> str:
    """Hashea una contraseña usando bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña coincide con su hash"""
    return pwd_context.verify(plain_password, hashed_password)


# ========================================
# 🔹 Obtener usuarios
# ========================================
def get_user_by_email(db: Session, email: str) -> Optional[Usuario]:
    """Obtiene un usuario por su email"""
    return db.query(Usuario).filter(Usuario.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[Usuario]:
    """Obtiene un usuario por su ID"""
    return db.query(Usuario).filter(Usuario.id_usuario == user_id).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene todos los usuarios con paginación"""
    return db.query(Usuario).offset(skip).limit(limit).all()


# ========================================
# 🔹 Crear usuario
# ========================================
def create_user(db: Session, user: UserCreate) -> Usuario:
    """Crea un nuevo usuario en la base de datos"""
    db_user = Usuario(
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        contrasena=hash_password(user.password),
        rol="user"  # Rol por defecto
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ========================================
# 🔹 Actualizar usuario
# ========================================
def update_user(db: Session, user_id: int, update_data: dict) -> Optional[Usuario]:
    """Actualiza los datos de un usuario"""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not db_user:
        return None

    # Si se está actualizando la contraseña, hashearla
    if "password" in update_data:
        update_data["contrasena"] = hash_password(update_data.pop("password"))

    # Actualizar solo los campos proporcionados
    for key, value in update_data.items():
        if hasattr(db_user, key) and value is not None:
            setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


# ========================================
# 🔹 Actualizar imagen de perfil
# ========================================
def update_user_image(db: Session, user_id: int, image_path: str) -> Optional[Usuario]:
    """Actualiza la imagen de perfil de un usuario"""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not db_user:
        return None

    db_user.imagen = image_path
    db.commit()
    db.refresh(db_user)
    return db_user


# ========================================
# 🔹 Eliminar usuario
# ========================================
def delete_user(db: Session, user_id: int) -> bool:
    """Elimina un usuario de la base de datos"""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not db_user:
        return False

    db.delete(db_user)
    db.commit()
    return True


# ========================================
# 🔹 Verificar credenciales (útil para login)
# ========================================
def authenticate_user(db: Session, email: str, password: str) -> Optional[Usuario]:
    """Autentica un usuario verificando email y contraseña"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.contrasena):
        return None
    return user


# ========================================
# 🔹 Cambiar contraseña
# ========================================
def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> Optional[Usuario]:
    """Cambia la contraseña de un usuario verificando la contraseña actual"""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not db_user:
        return None

    # Verificar que la contraseña actual sea correcta
    if not verify_password(old_password, db_user.contrasena):
        return None

    # Actualizar con la nueva contraseña
    db_user.contrasena = hash_password(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user


# ========================================
# 🔹 Actualizar rol de usuario
# ========================================
def update_user_role(db: Session, user_id: int, new_role: str) -> Optional[Usuario]:
    """Actualiza el rol de un usuario (admin, user, etc.)"""
    db_user = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not db_user:
        return None

    db_user.rol = new_role
    db.commit()
    db.refresh(db_user)
    return db_user


# ========================================
# 🔹 Verificar si existe un usuario
# ========================================
def user_exists(db: Session, email: str) -> bool:
    """Verifica si existe un usuario con el email proporcionado"""
    return db.query(Usuario).filter(Usuario.email == email).first() is not None


def user_exists_by_id(db: Session, user_id: int) -> bool:
    """Verifica si existe un usuario con el ID proporcionado"""
    return db.query(Usuario).filter(Usuario.id_usuario == user_id).first() is not None