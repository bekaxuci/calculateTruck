"""
This module handles API routes for user registration and authentication.
"""
from datetime import timedelta
from flask import Blueprint, request, jsonify
from api.models import db, User
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import logging
import os

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

# Obtener todos los usuarios
@api.route('/usuarios', methods=['GET'])
def get_all_users():
    try:
        users = User.query.all()  # Obtener todos los usuarios de la base de datos
        # Mostrar los usuarios en la consola del backend
        for user in users:
            print(f"Usuario: {user.first_name} {user.last_name}")  # Asegúrate de usar los campos correctos

        # Devolver la lista de usuarios serializados como respuesta JSON
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        print(f"Error en /usuarios: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500


# Route to register a new user
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data)  # For debugging

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    company = data.get('company')

    # Validate required fields
    if not email or not password or not first_name or not last_name:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    # Check if the user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El usuario ya existe"}), 400

    # Create new user with hashed password
    hashed_password = generate_password_hash(password)
    new_user = User(
        email=email,
        password_hash=hashed_password,
        first_name=first_name,
        last_name=last_name,
        company=company,
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "Usuario registrado con éxito"}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error al registrar el usuario: {str(e)}")  # Log the error
        return jsonify({"msg": f"Error al registrar el usuario: {str(e)}"}), 500



#INICIAR SESION
@api.route('/login', methods=['POST'])
def login_user():
    try:
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Validar que los campos no estén vacíos
        if not email or not password:
            logging.error("Email y contraseña son requeridos")
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        # Buscar el usuario en la base de datos
        user = User.query.filter_by(email=email).first()
        logging.info(f"Usuario buscado: {email}, Resultado: {user}")

        if user is None:
            logging.error(f"Usuario no encontrado para el email: {email}")
            return jsonify({"error": "Credenciales incorrectas"}), 401

        # Verificar la contraseña
        if not user.check_password(password):
            logging.error("Credenciales incorrectas: contraseña incorrecta")
            return jsonify({"error": "Credenciales incorrectas"}), 401

        # Crear el token de acceso
        token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
        return jsonify({'token': token, 'user': user.serialize()}), 200

    except Exception as e:
        logging.error(f"Error en /login: {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500