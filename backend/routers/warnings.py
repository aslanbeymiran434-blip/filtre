import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.warnings import WarningsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/warnings", tags=["warnings"])


# ---------- Pydantic Schemas ----------
class WarningsData(BaseModel):
    """Entity data schema (for create/update)"""
    user_id_tg: int
    user_name: str
    warning_count: int
    last_warning_date: str = None
    mute_end: str = None
    is_muted: bool
    created_at: Optional[datetime] = None


class WarningsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    user_id_tg: Optional[int] = None
    user_name: Optional[str] = None
    warning_count: Optional[int] = None
    last_warning_date: Optional[str] = None
    mute_end: Optional[str] = None
    is_muted: Optional[bool] = None
    created_at: Optional[datetime] = None


class WarningsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id_tg: int
    user_name: str
    warning_count: int
    last_warning_date: Optional[str] = None
    mute_end: Optional[str] = None
    is_muted: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WarningsListResponse(BaseModel):
    """List response schema"""
    items: List[WarningsResponse]
    total: int
    skip: int
    limit: int


class WarningsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[WarningsData]


class WarningsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: WarningsUpdateData


class WarningsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[WarningsBatchUpdateItem]


class WarningsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=WarningsListResponse)
async def query_warningss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query warningss with filtering, sorting, and pagination"""
    logger.debug(f"Querying warningss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = WarningsService(db)
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
        logger.debug(f"Found {result['total']} warningss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying warningss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=WarningsListResponse)
async def query_warningss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query warningss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying warningss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = WarningsService(db)
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
        logger.debug(f"Found {result['total']} warningss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying warningss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=WarningsResponse)
async def get_warnings(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single warnings by ID"""
    logger.debug(f"Fetching warnings with id: {id}, fields={fields}")
    
    service = WarningsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Warnings with id {id} not found")
            raise HTTPException(status_code=404, detail="Warnings not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching warnings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=WarningsResponse, status_code=201)
async def create_warnings(
    data: WarningsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new warnings"""
    logger.debug(f"Creating new warnings with data: {data}")
    
    service = WarningsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create warnings")
        
        logger.info(f"Warnings created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating warnings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating warnings: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[WarningsResponse], status_code=201)
async def create_warningss_batch(
    request: WarningsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple warningss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} warningss")
    
    service = WarningsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} warningss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[WarningsResponse])
async def update_warningss_batch(
    request: WarningsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple warningss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} warningss")
    
    service = WarningsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} warningss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=WarningsResponse)
async def update_warnings(
    id: int,
    data: WarningsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing warnings"""
    logger.debug(f"Updating warnings {id} with data: {data}")

    service = WarningsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Warnings with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Warnings not found")
        
        logger.info(f"Warnings {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating warnings {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating warnings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_warningss_batch(
    request: WarningsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple warningss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} warningss")
    
    service = WarningsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} warningss successfully")
        return {"message": f"Successfully deleted {deleted_count} warningss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_warnings(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single warnings by ID"""
    logger.debug(f"Deleting warnings with id: {id}")
    
    service = WarningsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Warnings with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Warnings not found")
        
        logger.info(f"Warnings {id} deleted successfully")
        return {"message": "Warnings deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting warnings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")