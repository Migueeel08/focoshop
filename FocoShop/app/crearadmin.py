from app.models import Usuario
from app.database import SessionLocal
from passlib.hash import bcrypt

db = SessionLocal()

nuevo_admin = Usuario(
    nombre="Admin",
    apellido="Principal",
    email="admin@focoshop.com",
    contrasena=bcrypt.hash("myrlet"),
    rol="admin"
)

db.add(nuevo_admin)
db.commit()
db.close()
