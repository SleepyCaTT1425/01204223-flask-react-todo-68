from flask import Flask, request, jsonify
from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy                            # ลบออกได้
# from sqlalchemy.orm import DeclarativeBase                         # ลบออกได้
# from sqlalchemy import Integer, String, ForeignKey                 # ลบออกได้
# from sqlalchemy.orm import Mapped, mapped_column, relationship     # ลบออกได้
from flask_migrate import Migrate

from models import TodoItem, Comment, db, User                             # import จาก models

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_jwt_extended import JWTManager

import click
import os
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///todos.db')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY','fdslkfjsdlkufewhjroiewurewrew')

# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
# app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')


jwt = JWTManager(app)


db.init_app(app)                                                     
migrate = Migrate(app, db)  


# INITIAL_TODOS = [
#     TodoItem(title='Learn Flask'),
#     TodoItem(title='Build a Flask App'),
# ]

# with app.app_context():
#     if TodoItem.query.count() == 0:
#          for item in INITIAL_TODOS:
#              db.session.add(item)
#          db.session.commit()

todo_list = [
    { "id": 1,
      "title": 'Learn Flask',
      "done": True },
    { "id": 2,
      "title": 'Build a Flask App',
      "done": False },  
]

# @app.route('/api/todos/', methods=['GET'])
# def get_todos():
#     return jsonify(todo_list)

@app.route('/api/todos/', methods=['GET'])
@jwt_required()
def get_todos():
    todos = TodoItem.query.all()
    return jsonify([todo.to_dict() for todo in todos])

# def new_todo(data):
#     if len(todo_list) == 0:
#         id = 1
#     else:
#         id = 1 + max([todo['id'] for todo in todo_list])

#     if 'title' not in data:
#         return None
    
#     return {
#         "id": id,
#         "title": data['title'],
#         "done": getattr(data, 'done', False),
#     }

def new_todo(data):
    return TodoItem(title=data['title'], 
            done=data.get('done', False))

# @app.route('/api/todos/', methods=['POST'])
# def add_todo():
#     data = request.get_json()
#     todo = new_todo(data)
#     if todo:
#         todo_list.append(todo)
#         return jsonify(todo)
#     else:
#         # return http response code 400 for bad requests
#         return (jsonify({'error': 'Invalid todo data'}), 400)  

@app.route('/api/todos/', methods=['POST'])
def add_todo():
    data = request.get_json()
    todo = new_todo(data)
    if todo:
        db.session.add(todo)                       # บรรทัดที่ปรับใหม่
        db.session.commit()                        # บรรทัดที่ปรับใหม่ 
        return jsonify(todo.to_dict())             # บรรทัดที่ปรับใหม่
    else:
        # return http response code 400 for bad requests
        return (jsonify({'error': 'Invalid todo data'}), 400)
    

# @app.route('/api/todos/<int:id>/toggle/', methods=['PATCH'])
# def toggle_todo(id):
#     todos = [todo for todo in todo_list if todo['id'] == id]
#     if not todos:
#         return (jsonify({'error': 'Todo not found'}), 404)
#     todo = todos[0]
#     todo['done'] = not todo['done']
#     return jsonify(todo)

# @app.route('/api/todos/<int:id>/toggle/', methods=['PATCH'])
# def toggle_todo(id):
#     todo = TodoItem.query.get(id)
#     if not todo:
#         return (jsonify({'error': 'Todo not found'}), 404)
#     todo.done = not todo.done
#     db.session.commit()
#     return jsonify(todo.to_dict())

@app.route('/api/todos/<int:id>/toggle/', methods=['PATCH'])
def toggle_todo(id):
    todo = TodoItem.query.get_or_404(id)
    todo.done = not todo.done
    db.session.commit()
    return jsonify(todo.to_dict())  


# @app.route('/api/todos/<int:id>/', methods=['DELETE'])
# def delete_todo(id):
#     global todo_list
#     todos = [todo for todo in todo_list if todo['id'] == id]
#     if not todos:
#         return (jsonify({'error': 'Todo not found'}), 404)
#     todo_list = [todo for todo in todo_list if todo['id'] != id]
#     return jsonify({'message': 'Todo deleted successfully'})

@app.route('/api/todos/<int:id>/', methods=['DELETE'])
def delete_todo(id):
    todo = TodoItem.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Todo deleted successfully'})

@app.route('/api/todos/<int:todo_id>/comments/', methods=['POST'])
def add_comment(todo_id):
    todo_item = TodoItem.query.get_or_404(todo_id)

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Comment message is required'}), 400

    comment = Comment(
        message=data['message'],
        todo_id=todo_item.id
    )
    db.session.add(comment)
    db.session.commit()
 
    return jsonify(comment.to_dict())

@app.route('/api/login/', methods=['POST'])
def login():
    # data = request.get_json()
    # if not data or 'username' not in data or 'password' not in data:
    #     return jsonify({'error': 'Username and password are required'}), 400

    # user = User.query.filter_by(username=data['username']).first()
    # if not user or not user.check_password(data['password']):
    #     return jsonify({'error': 'Invalid username or password'}), 401

    # return jsonify({'message': 'Login successful'})

    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=user.username)
    return jsonify(access_token=access_token)

@app.cli.command("create-user")
@click.argument("username")
@click.argument("full_name")
@click.argument("password")
def create_user(username, full_name, password):
    # print(username, full_name, password)user = User.query.filter_by(username=username).first()
    user = User.query.filter_by(username=username).first()
    if user:
        click.echo("User already exists.")
        return
    user = User(username=username, full_name=full_name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    click.echo(f"User {username} created successfully.")

