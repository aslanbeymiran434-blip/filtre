import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.bot_filters import Bot_filters

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Bot_filtersService:
    """Service layer for Bot_filters operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Bot_filters]:
        """Create a new bot_filters"""
        try:
            obj = Bot_filters(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created bot_filters with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating bot_filters: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Bot_filters]:
        """Get bot_filters by ID"""
        try:
            query = select(Bot_filters).where(Bot_filters.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching bot_filters {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of bot_filterss"""
        try:
            query = select(Bot_filters)
            count_query = select(func.count(Bot_filters.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Bot_filters, field):
                        query = query.where(getattr(Bot_filters, field) == value)
                        count_query = count_query.where(getattr(Bot_filters, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Bot_filters, field_name):
                        query = query.order_by(getattr(Bot_filters, field_name).desc())
                else:
                    if hasattr(Bot_filters, sort):
                        query = query.order_by(getattr(Bot_filters, sort))
            else:
                query = query.order_by(Bot_filters.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching bot_filters list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Bot_filters]:
        """Update bot_filters"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Bot_filters {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated bot_filters {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating bot_filters {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete bot_filters"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Bot_filters {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted bot_filters {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting bot_filters {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Bot_filters]:
        """Get bot_filters by any field"""
        try:
            if not hasattr(Bot_filters, field_name):
                raise ValueError(f"Field {field_name} does not exist on Bot_filters")
            result = await self.db.execute(
                select(Bot_filters).where(getattr(Bot_filters, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching bot_filters by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Bot_filters]:
        """Get list of bot_filterss filtered by field"""
        try:
            if not hasattr(Bot_filters, field_name):
                raise ValueError(f"Field {field_name} does not exist on Bot_filters")
            result = await self.db.execute(
                select(Bot_filters)
                .where(getattr(Bot_filters, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Bot_filters.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching bot_filterss by {field_name}: {str(e)}")
            raise