import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.authorized_roles import Authorized_roles

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Authorized_rolesService:
    """Service layer for Authorized_roles operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Authorized_roles]:
        """Create a new authorized_roles"""
        try:
            obj = Authorized_roles(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created authorized_roles with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating authorized_roles: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Authorized_roles]:
        """Get authorized_roles by ID"""
        try:
            query = select(Authorized_roles).where(Authorized_roles.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching authorized_roles {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of authorized_roless"""
        try:
            query = select(Authorized_roles)
            count_query = select(func.count(Authorized_roles.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Authorized_roles, field):
                        query = query.where(getattr(Authorized_roles, field) == value)
                        count_query = count_query.where(getattr(Authorized_roles, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Authorized_roles, field_name):
                        query = query.order_by(getattr(Authorized_roles, field_name).desc())
                else:
                    if hasattr(Authorized_roles, sort):
                        query = query.order_by(getattr(Authorized_roles, sort))
            else:
                query = query.order_by(Authorized_roles.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching authorized_roles list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Authorized_roles]:
        """Update authorized_roles"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Authorized_roles {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated authorized_roles {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating authorized_roles {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete authorized_roles"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Authorized_roles {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted authorized_roles {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting authorized_roles {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Authorized_roles]:
        """Get authorized_roles by any field"""
        try:
            if not hasattr(Authorized_roles, field_name):
                raise ValueError(f"Field {field_name} does not exist on Authorized_roles")
            result = await self.db.execute(
                select(Authorized_roles).where(getattr(Authorized_roles, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching authorized_roles by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Authorized_roles]:
        """Get list of authorized_roless filtered by field"""
        try:
            if not hasattr(Authorized_roles, field_name):
                raise ValueError(f"Field {field_name} does not exist on Authorized_roles")
            result = await self.db.execute(
                select(Authorized_roles)
                .where(getattr(Authorized_roles, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Authorized_roles.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching authorized_roless by {field_name}: {str(e)}")
            raise