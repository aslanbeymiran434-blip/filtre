import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.authorized_roles import Authorized_rolesService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/authorized_roles", tags=["authorized_roles"])


# ---------- Pydantic Schemas ----------
class Authorized_rolesData(BaseModel):
    """Entity data schema (for create/update)"""
    user_id_tg: int
    user_name: str
    role: str
    added_date: str = None
    created_at: Optional[datetime] = None


class Authorized_rolesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    user_id_tg: Optional[int] = None
    user_name: Optional[str] = None
    role: Optional[str] = None
    added_date: Optional[str] = None
    created_at: Optional[datetime] = None


class Authorized_rolesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id_tg: int
    user_name: str
    role: str
    added_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Authorized_rolesListResponse(BaseModel):
    """List response schema"""
    items: List[Authorized_rolesResponse]
    total: int
    skip: int
    limit: int


class Authorized_rolesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Authorized_rolesData]


class Authorized_rolesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Authorized_rolesUpdateData


class Authorized_rolesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Authorized_rolesBatchUpdateItem]


class Authorized_rolesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Authorized_rolesListResponse)
async def query_authorized_roless(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query authorized_roless with filtering, sorting, and pagination"""
    logger.debug(f"Querying authorized_roless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Authorized_rolesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} authorized_roless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying authorized_roless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Authorized_rolesListResponse)
async def query_authorized_roless_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query authorized_roless with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying authorized_roless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Authorized_rolesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} authorized_roless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying authorized_roless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Authorized_rolesResponse)
async def get_authorized_roles(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single authorized_roles by ID"""
    logger.debug(f"Fetching authorized_roles with id: {id}, fields={fields}")
    
    service = Authorized_rolesService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Authorized_roles with id {id} not found")
            raise HTTPException(status_code=404, detail="Authorized_roles not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching authorized_roles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Authorized_rolesResponse, status_code=201)
async def create_authorized_roles(
    data: Authorized_rolesData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new authorized_roles"""
    logger.debug(f"Creating new authorized_roles with data: {data}")
    
    service = Authorized_rolesService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create authorized_roles")
        
        logger.info(f"Authorized_roles created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating authorized_roles: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating authorized_roles: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Authorized_rolesResponse], status_code=201)
async def create_authorized_roless_batch(
    request: Authorized_rolesBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple authorized_roless in a single request"""
    logger.debug(f"Batch creating {len(request.items)} authorized_roless")
    
    service = Authorized_rolesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} authorized_roless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Authorized_rolesResponse])
async def update_authorized_roless_batch(
    request: Authorized_rolesBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple authorized_roless in a single request"""
    logger.debug(f"Batch updating {len(request.items)} authorized_roless")
    
    service = Authorized_rolesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} authorized_roless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Authorized_rolesResponse)
async def update_authorized_roles(
    id: int,
    data: Authorized_rolesUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing authorized_roles"""
    logger.debug(f"Updating authorized_roles {id} with data: {data}")

    service = Authorized_rolesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Authorized_roles with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Authorized_roles not found")
        
        logger.info(f"Authorized_roles {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating authorized_roles {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating authorized_roles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_authorized_roless_batch(
    request: Authorized_rolesBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple authorized_roless by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} authorized_roless")
    
    service = Authorized_rolesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} authorized_roless successfully")
        return {"message": f"Successfully deleted {deleted_count} authorized_roless", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_authorized_roles(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single authorized_roles by ID"""
    logger.debug(f"Deleting authorized_roles with id: {id}")
    
    service = Authorized_rolesService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Authorized_roles with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Authorized_roles not found")
        
        logger.info(f"Authorized_roles {id} deleted successfully")
        return {"message": "Authorized_roles deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting authorized_roles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")