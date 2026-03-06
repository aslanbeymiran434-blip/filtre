from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Site_commands(Base):
    __tablename__ = "site_commands"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    command_name = Column(String, nullable=False)
    site_name = Column(String, nullable=False)
    site_url = Column(String, nullable=False)
    message_text = Column(String, nullable=True)
    button_text = Column(String, nullable=True)
    button_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)