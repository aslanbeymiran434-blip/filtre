from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Warnings(Base):
    __tablename__ = "warnings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id_tg = Column(Integer, nullable=False)
    user_name = Column(String, nullable=False)
    warning_count = Column(Integer, nullable=False)
    last_warning_date = Column(String, nullable=True)
    mute_end = Column(String, nullable=True)
    is_muted = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)