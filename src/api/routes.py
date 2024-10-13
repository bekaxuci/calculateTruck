"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

    # Ruta para registrar un nuevo usuario
from flask import jsonify, abort, request
from werkzeug.security import generate_password_hash
import logging

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data)  # Para depuración

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    company = data.get('company')

    # Validación de campos obligatorios
    if not email or not password or not first_name or not last_name:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    # Verificar si el usuario ya existe
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El usuario ya existe"}), 400

    # Crear el nuevo usuario con contraseña encriptada
    hashed_password = generate_password_hash(password)
    new_user = User(
        email=email,
        password_hash=hashed_password,  # Cambiado a `password_hash`
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
        logging.error(f"Error al registrar el usuario: {str(e)}")  # Registrar el error
        return jsonify({"msg": f"Error al registrar el usuario: {str(e)}"}), 500

    

    
