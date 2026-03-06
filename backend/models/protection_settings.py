from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Protection_settings(Base):
    __tablename__ = "protection_settings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    setting_key = Column(String, nullable=False)
    setting_value = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=True)