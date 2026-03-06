from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Authorized_roles(Base):
    __tablename__ = "authorized_roles"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id_tg = Column(Integer, nullable=False)
    user_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    added_date = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)