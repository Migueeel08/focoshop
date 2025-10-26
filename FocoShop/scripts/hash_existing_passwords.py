# scripts/hash_existing_passwords.py
from app.database import SessionLocal
from app.models.usuarios import Usuario
from app.crud.usuarios import hash_password

db = SessionLocal()

usuarios = db.query(Usuario).all()
for u in usuarios:
    # si la contraseña no está hasheada, la hasheamos
    if not u.contrasena.startswith("$2b$"):
        u.contrasena = hash_password(u.contrasena)
        db.add(u)

db.commit()
db.close()
print("Contraseñas antiguas hasheadas ✅")
