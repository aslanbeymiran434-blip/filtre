from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Bot_filters(Base):
    __tablename__ = "bot_filters"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    filter_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    buttons_json = Column(String, nullable=True)
    link = Column(String, nullable=True)
    assigned_chat_ids = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False)
    created_date = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)