"""Pydantic models and request/response schemas for FreshRoute."""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime

Role = Literal["customer", "restaurant_owner", "rider"]
OrderStatus = Literal["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    role: Role
    # Required only for role == "customer" (delivery address) or "restaurant_owner" (restaurant location)
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lng: Optional[float] = Field(default=None, ge=-180, le=180)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: Role
    lat: Optional[float]
    lng: Optional[float]

class RestaurantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    cuisine: str = Field(min_length=1, max_length=60)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    image_url: Optional[str] = None

class RestaurantOut(BaseModel):
    id: int
    owner_id: int
    name: str
    cuisine: str
    lat: float
    lng: float
    image_url: Optional[str] = None

class MenuItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)
    price_cents: int = Field(gt=0, le=100000)
    available: bool = True
    image_url: Optional[str] = None

class MenuItemOut(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str
    price_cents: int
    available: bool
    image_url: Optional[str] = None

class OrderItemIn(BaseModel):
    menu_item_id: int
    quantity: int = Field(gt=0, le=50)

class OrderCreate(BaseModel):
    restaurant_id: int
    items: list[OrderItemIn] = Field(min_length=1)
    delivery_lat: float = Field(ge=-90, le=90)
    delivery_lng: float = Field(ge=-180, le=180)

class OrderItemOut(BaseModel):
    menu_item_id: int
    name: str
    quantity: int
    unit_price_cents: int
    image_url: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    customer_id: int
    restaurant_id: int
    restaurant_name: str
    status: OrderStatus
    subtotal_cents: int
    delivery_fee_cents: int
    total_cents: int
    distance_km: float
    delivery_lat: float
    delivery_lng: float
    rider_id: Optional[int]
    created_at: str
    items: list[OrderItemOut]

class StatusUpdate(BaseModel):
    status: OrderStatus

class ClaimDelivery(BaseModel):
    pass  # rider identity comes from auth; no body needed beyond the order id in the path
