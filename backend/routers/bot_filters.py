import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.bot_filters import Bot_filtersService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/bot_filters", tags=["bot_filters"])


# ---------- Pydantic Schemas ----------
class Bot_filtersData(BaseModel):
    """Entity data schema (for create/update)"""
    filter_name: str
    description: str = None
    buttons_json: str = None
    link: str = None
    assigned_chat_ids: str = None
    is_active: bool
    created_date: str = None
    created_at: Optional[datetime] = None


class Bot_filtersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    filter_name: Optional[str] = None
    description: Optional[str] = None
    buttons_json: Optional[str] = None
    link: Optional[str] = None
    assigned_chat_ids: Optional[str] = None
    is_active: Optional[bool] = None
    created_date: Optional[str] = None
    created_at: Optional[datetime] = None


class Bot_filtersResponse(BaseModel):
    """Entity response schema"""
    id: int
    filter_name: str
    description: Optional[str] = None
    buttons_json: Optional[str] = None
    link: Optional[str] = None
    assigned_chat_ids: Optional[str] = None
    is_active: bool
    created_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Bot_filtersListResponse(BaseModel):
    """List response schema"""
    items: List[Bot_filtersResponse]
    total: int
    skip: int
    limit: int


class Bot_filtersBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Bot_filtersData]


class Bot_filtersBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Bot_filtersUpdateData


class Bot_filtersBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Bot_filtersBatchUpdateItem]


class Bot_filtersBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Bot_filtersListResponse)
async def query_bot_filterss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query bot_filterss with filtering, sorting, and pagination"""
    logger.debug(f"Querying bot_filterss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Bot_filtersService(db)
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
        logger.debug(f"Found {result['total']} bot_filterss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying bot_filterss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Bot_filtersListResponse)
async def query_bot_filterss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query bot_filterss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying bot_filterss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Bot_filtersService(db)
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
        logger.debug(f"Found {result['total']} bot_filterss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying bot_filterss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Bot_filtersResponse)
async def get_bot_filters(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single bot_filters by ID"""
    logger.debug(f"Fetching bot_filters with id: {id}, fields={fields}")
    
    service = Bot_filtersService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Bot_filters with id {id} not found")
            raise HTTPException(status_code=404, detail="Bot_filters not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching bot_filters {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Bot_filtersResponse, status_code=201)
async def create_bot_filters(
    data: Bot_filtersData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new bot_filters"""
    logger.debug(f"Creating new bot_filters with data: {data}")
    
    service = Bot_filtersService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create bot_filters")
        
        logger.info(f"Bot_filters created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating bot_filters: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating bot_filters: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Bot_filtersResponse], status_code=201)
async def create_bot_filterss_batch(
    request: Bot_filtersBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple bot_filterss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} bot_filterss")
    
    service = Bot_filtersService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} bot_filterss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Bot_filtersResponse])
async def update_bot_filterss_batch(
    request: Bot_filtersBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple bot_filterss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} bot_filterss")
    
    service = Bot_filtersService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} bot_filterss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Bot_filtersResponse)
async def update_bot_filters(
    id: int,
    data: Bot_filtersUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing bot_filters"""
    logger.debug(f"Updating bot_filters {id} with data: {data}")

    service = Bot_filtersService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Bot_filters with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Bot_filters not found")
        
        logger.info(f"Bot_filters {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating bot_filters {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating bot_filters {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_bot_filterss_batch(
    request: Bot_filtersBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple bot_filterss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} bot_filterss")
    
    service = Bot_filtersService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} bot_filterss successfully")
        return {"message": f"Successfully deleted {deleted_count} bot_filterss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_bot_filters(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single bot_filters by ID"""
    logger.debug(f"Deleting bot_filters with id: {id}")
    
    service = Bot_filtersService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Bot_filters with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Bot_filters not found")
        
        logger.info(f"Bot_filters {id} deleted successfully")
        return {"message": "Bot_filters deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting bot_filters {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")