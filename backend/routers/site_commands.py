import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.site_commands import Site_commandsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/site_commands", tags=["site_commands"])


# ---------- Pydantic Schemas ----------
class Site_commandsData(BaseModel):
    """Entity data schema (for create/update)"""
    command_name: str
    site_name: str
    site_url: str
    message_text: str = None
    button_text: str = None
    button_url: str = None
    created_at: Optional[datetime] = None


class Site_commandsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    command_name: Optional[str] = None
    site_name: Optional[str] = None
    site_url: Optional[str] = None
    message_text: Optional[str] = None
    button_text: Optional[str] = None
    button_url: Optional[str] = None
    created_at: Optional[datetime] = None


class Site_commandsResponse(BaseModel):
    """Entity response schema"""
    id: int
    command_name: str
    site_name: str
    site_url: str
    message_text: Optional[str] = None
    button_text: Optional[str] = None
    button_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Site_commandsListResponse(BaseModel):
    """List response schema"""
    items: List[Site_commandsResponse]
    total: int
    skip: int
    limit: int


class Site_commandsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Site_commandsData]


class Site_commandsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Site_commandsUpdateData


class Site_commandsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Site_commandsBatchUpdateItem]


class Site_commandsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Site_commandsListResponse)
async def query_site_commandss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query site_commandss with filtering, sorting, and pagination"""
    logger.debug(f"Querying site_commandss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Site_commandsService(db)
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
        logger.debug(f"Found {result['total']} site_commandss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying site_commandss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Site_commandsListResponse)
async def query_site_commandss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query site_commandss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying site_commandss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Site_commandsService(db)
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
        logger.debug(f"Found {result['total']} site_commandss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying site_commandss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Site_commandsResponse)
async def get_site_commands(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single site_commands by ID"""
    logger.debug(f"Fetching site_commands with id: {id}, fields={fields}")
    
    service = Site_commandsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Site_commands with id {id} not found")
            raise HTTPException(status_code=404, detail="Site_commands not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching site_commands {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Site_commandsResponse, status_code=201)
async def create_site_commands(
    data: Site_commandsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new site_commands"""
    logger.debug(f"Creating new site_commands with data: {data}")
    
    service = Site_commandsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create site_commands")
        
        logger.info(f"Site_commands created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating site_commands: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating site_commands: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Site_commandsResponse], status_code=201)
async def create_site_commandss_batch(
    request: Site_commandsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple site_commandss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} site_commandss")
    
    service = Site_commandsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} site_commandss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Site_commandsResponse])
async def update_site_commandss_batch(
    request: Site_commandsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple site_commandss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} site_commandss")
    
    service = Site_commandsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} site_commandss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Site_commandsResponse)
async def update_site_commands(
    id: int,
    data: Site_commandsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing site_commands"""
    logger.debug(f"Updating site_commands {id} with data: {data}")

    service = Site_commandsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Site_commands with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Site_commands not found")
        
        logger.info(f"Site_commands {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating site_commands {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating site_commands {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_site_commandss_batch(
    request: Site_commandsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple site_commandss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} site_commandss")
    
    service = Site_commandsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} site_commandss successfully")
        return {"message": f"Successfully deleted {deleted_count} site_commandss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_site_commands(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single site_commands by ID"""
    logger.debug(f"Deleting site_commands with id: {id}")
    
    service = Site_commandsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Site_commands with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Site_commands not found")
        
        logger.info(f"Site_commands {id} deleted successfully")
        return {"message": "Site_commands deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site_commands {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")