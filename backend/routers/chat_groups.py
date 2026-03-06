import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.chat_groups import Chat_groupsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/chat_groups", tags=["chat_groups"])


# ---------- Pydantic Schemas ----------
class Chat_groupsData(BaseModel):
    """Entity data schema (for create/update)"""
    chat_id: str
    chat_name: str
    is_active: bool
    member_count: int = None
    added_date: str = None
    created_at: Optional[datetime] = None


class Chat_groupsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    chat_id: Optional[str] = None
    chat_name: Optional[str] = None
    is_active: Optional[bool] = None
    member_count: Optional[int] = None
    added_date: Optional[str] = None
    created_at: Optional[datetime] = None


class Chat_groupsResponse(BaseModel):
    """Entity response schema"""
    id: int
    chat_id: str
    chat_name: str
    is_active: bool
    member_count: Optional[int] = None
    added_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Chat_groupsListResponse(BaseModel):
    """List response schema"""
    items: List[Chat_groupsResponse]
    total: int
    skip: int
    limit: int


class Chat_groupsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Chat_groupsData]


class Chat_groupsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Chat_groupsUpdateData


class Chat_groupsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Chat_groupsBatchUpdateItem]


class Chat_groupsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Chat_groupsListResponse)
async def query_chat_groupss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query chat_groupss with filtering, sorting, and pagination"""
    logger.debug(f"Querying chat_groupss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Chat_groupsService(db)
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
        logger.debug(f"Found {result['total']} chat_groupss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying chat_groupss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Chat_groupsListResponse)
async def query_chat_groupss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query chat_groupss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying chat_groupss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Chat_groupsService(db)
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
        logger.debug(f"Found {result['total']} chat_groupss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying chat_groupss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Chat_groupsResponse)
async def get_chat_groups(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single chat_groups by ID"""
    logger.debug(f"Fetching chat_groups with id: {id}, fields={fields}")
    
    service = Chat_groupsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Chat_groups with id {id} not found")
            raise HTTPException(status_code=404, detail="Chat_groups not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chat_groups {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Chat_groupsResponse, status_code=201)
async def create_chat_groups(
    data: Chat_groupsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new chat_groups"""
    logger.debug(f"Creating new chat_groups with data: {data}")
    
    service = Chat_groupsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create chat_groups")
        
        logger.info(f"Chat_groups created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating chat_groups: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating chat_groups: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Chat_groupsResponse], status_code=201)
async def create_chat_groupss_batch(
    request: Chat_groupsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple chat_groupss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} chat_groupss")
    
    service = Chat_groupsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} chat_groupss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Chat_groupsResponse])
async def update_chat_groupss_batch(
    request: Chat_groupsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple chat_groupss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} chat_groupss")
    
    service = Chat_groupsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} chat_groupss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Chat_groupsResponse)
async def update_chat_groups(
    id: int,
    data: Chat_groupsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing chat_groups"""
    logger.debug(f"Updating chat_groups {id} with data: {data}")

    service = Chat_groupsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Chat_groups with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Chat_groups not found")
        
        logger.info(f"Chat_groups {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating chat_groups {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating chat_groups {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_chat_groupss_batch(
    request: Chat_groupsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple chat_groupss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} chat_groupss")
    
    service = Chat_groupsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} chat_groupss successfully")
        return {"message": f"Successfully deleted {deleted_count} chat_groupss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_chat_groups(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single chat_groups by ID"""
    logger.debug(f"Deleting chat_groups with id: {id}")
    
    service = Chat_groupsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Chat_groups with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Chat_groups not found")
        
        logger.info(f"Chat_groups {id} deleted successfully")
        return {"message": "Chat_groups deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat_groups {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")