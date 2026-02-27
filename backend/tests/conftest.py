import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest

from main import app as flask_app
from models import db, TodoItem

@pytest.fixture
def app():
    flask_app.config.update(
        {
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': f'sqlite:///:memory:',
        }
    )

    with flask_app.app_context():
        db.drop_all()
        db.create_all()

    return flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def app_context(app):
    with app.app_context():
        yield

def create_todo(title='Sample todo', done=False):
    todo = TodoItem(title=title, done=done)
    db.session.add(todo)
    db.session.commit()
    return todo

@pytest.fixture
def sample_todo_items(app_context):
    todo1 = create_todo(title='Todo 1', done=False)
    todo2 = create_todo(title='Todo 2', done=True)
    return [todo1, todo2]