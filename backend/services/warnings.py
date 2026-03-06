import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.warnings import Warnings

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class WarningsService:
    """Service layer for Warnings operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Warnings]:
        """Create a new warnings"""
        try:
            obj = Warnings(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created warnings with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating warnings: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Warnings]:
        """Get warnings by ID"""
        try:
            query = select(Warnings).where(Warnings.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching warnings {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of warningss"""
        try:
            query = select(Warnings)
            count_query = select(func.count(Warnings.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Warnings, field):
                        query = query.where(getattr(Warnings, field) == value)
                        count_query = count_query.where(getattr(Warnings, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Warnings, field_name):
                        query = query.order_by(getattr(Warnings, field_name).desc())
                else:
                    if hasattr(Warnings, sort):
                        query = query.order_by(getattr(Warnings, sort))
            else:
                query = query.order_by(Warnings.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching warnings list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Warnings]:
        """Update warnings"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Warnings {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated warnings {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating warnings {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete warnings"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Warnings {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted warnings {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting warnings {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Warnings]:
        """Get warnings by any field"""
        try:
            if not hasattr(Warnings, field_name):
                raise ValueError(f"Field {field_name} does not exist on Warnings")
            result = await self.db.execute(
                select(Warnings).where(getattr(Warnings, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching warnings by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Warnings]:
        """Get list of warningss filtered by field"""
        try:
            if not hasattr(Warnings, field_name):
                raise ValueError(f"Field {field_name} does not exist on Warnings")
            result = await self.db.execute(
                select(Warnings)
                .where(getattr(Warnings, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Warnings.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching warningss by {field_name}: {str(e)}")
            raise