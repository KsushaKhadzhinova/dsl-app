from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Единственное место в приложении, где встречается SQL/ORM-запрос к users."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_email(self, email: str) -> User | None:
        return self._db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> User | None:
        return self._db.query(User).filter(User.username == username).first()

    def get_by_id(self, user_id: str) -> User | None:
        return self._db.query(User).filter(User.id == user_id).first()

    def create(self, *, username: str, email: str, hashed_password: str) -> User:
        user = User(username=username, email=email, hashed_password=hashed_password)
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)
        return user
