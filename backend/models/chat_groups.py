from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Chat_groups(Base):
    __tablename__ = "chat_groups"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    chat_id = Column(String, nullable=False)
    chat_name = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False)
    member_count = Column(Integer, nullable=True)
    added_date = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)