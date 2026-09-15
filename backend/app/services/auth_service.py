from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthError(Exception):
    pass


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    def register(self, *, username: str, email: str, password: str) -> User:
        if self._users.get_by_email(email) is not None:
            raise AuthError("Пользователь с таким email уже существует.")
        return self._users.create(username=username, email=email, hashed_password=hash_password(password))

    def login(self, *, email: str, password: str) -> str:
        user = self._users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise AuthError("Неверный email или пароль.")
        return create_access_token(subject=str(user.id))
