import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.chat_groups import Chat_groups

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Chat_groupsService:
    """Service layer for Chat_groups operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Chat_groups]:
        """Create a new chat_groups"""
        try:
            obj = Chat_groups(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created chat_groups with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating chat_groups: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Chat_groups]:
        """Get chat_groups by ID"""
        try:
            query = select(Chat_groups).where(Chat_groups.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching chat_groups {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of chat_groupss"""
        try:
            query = select(Chat_groups)
            count_query = select(func.count(Chat_groups.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Chat_groups, field):
                        query = query.where(getattr(Chat_groups, field) == value)
                        count_query = count_query.where(getattr(Chat_groups, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Chat_groups, field_name):
                        query = query.order_by(getattr(Chat_groups, field_name).desc())
                else:
                    if hasattr(Chat_groups, sort):
                        query = query.order_by(getattr(Chat_groups, sort))
            else:
                query = query.order_by(Chat_groups.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching chat_groups list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Chat_groups]:
        """Update chat_groups"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Chat_groups {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated chat_groups {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating chat_groups {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete chat_groups"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Chat_groups {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted chat_groups {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting chat_groups {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Chat_groups]:
        """Get chat_groups by any field"""
        try:
            if not hasattr(Chat_groups, field_name):
                raise ValueError(f"Field {field_name} does not exist on Chat_groups")
            result = await self.db.execute(
                select(Chat_groups).where(getattr(Chat_groups, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching chat_groups by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Chat_groups]:
        """Get list of chat_groupss filtered by field"""
        try:
            if not hasattr(Chat_groups, field_name):
                raise ValueError(f"Field {field_name} does not exist on Chat_groups")
            result = await self.db.execute(
                select(Chat_groups)
                .where(getattr(Chat_groups, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Chat_groups.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching chat_groupss by {field_name}: {str(e)}")
            raise