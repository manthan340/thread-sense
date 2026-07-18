from enum import Enum

from pydantic import BaseModel, Field, HttpUrl


class Slot(str, Enum):
    top = "top"
    bottom = "bottom"
    one_piece = "one_piece"
    outerwear = "outerwear"
    shoes = "shoes"
    accessory = "accessory"


class Category(str, Enum):
    t_shirt = "t_shirt"
    shirt = "shirt"
    blouse = "blouse"
    polo = "polo"
    sweater = "sweater"
    hoodie = "hoodie"
    tank_top = "tank_top"
    other_top = "other_top"
    jeans = "jeans"
    trousers = "trousers"
    chinos = "chinos"
    shorts = "shorts"
    skirt = "skirt"
    other_bottom = "other_bottom"
    dress = "dress"
    jumpsuit = "jumpsuit"
    other_one_piece = "other_one_piece"
    jacket = "jacket"
    coat = "coat"
    blazer = "blazer"
    vest = "vest"
    other_outerwear = "other_outerwear"
    sneakers = "sneakers"
    boots = "boots"
    loafers = "loafers"
    heels = "heels"
    sandals = "sandals"
    other_shoes = "other_shoes"
    belt = "belt"
    bag = "bag"
    hat = "hat"
    scarf = "scarf"
    jewelry = "jewelry"
    other_accessory = "other_accessory"


class Pattern(str, Enum):
    solid = "solid"
    stripe = "stripe"
    check = "check"
    floral = "floral"
    graphic = "graphic"
    animal = "animal"
    abstract = "abstract"
    other = "other"


class Formality(str, Enum):
    casual = "casual"
    smart_casual = "smart_casual"
    business = "business"
    formal = "formal"
    athletic = "athletic"


class Season(str, Enum):
    spring = "spring"
    summer = "summer"
    fall = "fall"
    winter = "winter"
    all_season = "all_season"


class Color(str, Enum):
    black = "black"
    white = "white"
    gray = "gray"
    beige = "beige"
    brown = "brown"
    navy = "navy"
    blue = "blue"
    light_blue = "light_blue"
    green = "green"
    olive = "olive"
    red = "red"
    burgundy = "burgundy"
    pink = "pink"
    purple = "purple"
    yellow = "yellow"
    orange = "orange"
    cream = "cream"
    gold = "gold"
    silver = "silver"
    multicolor = "multicolor"
    other = "other"


class StyleTag(str, Enum):
    minimal = "minimal"
    classic = "classic"
    streetwear = "streetwear"
    sporty = "sporty"
    boho = "boho"
    preppy = "preppy"
    workwear = "workwear"
    elegant = "elegant"
    edgy = "edgy"
    vintage = "vintage"
    basics = "basics"


class ClothingItem(BaseModel):
    slot: Slot
    category: Category
    primary_colors: list[Color] = Field(min_length=1, max_length=2)
    secondary_colors: list[Color] = Field(default_factory=list, max_length=3)
    pattern: Pattern
    formality: Formality
    season: list[Season] = Field(min_length=1, max_length=5)
    style_tags: list[StyleTag] = Field(min_length=1, max_length=3)
    description: str = Field(description="One concise sentence for embeddings/search.")
    match_text: str = Field(description="Short comma-separated matching phrase.")
    confidence: float = Field(ge=0, le=1)


class WardrobeExtraction(BaseModel):
    items: list[ClothingItem]
    notes: str = Field(
        description="Brief note if image is unclear, multi-person, or has no clothing."
    )


class IngestRequest(BaseModel):
    user_id: str = Field(min_length=1)
    image_url: HttpUrl


class SavedWardrobeItem(BaseModel):
    id: str
    user_id: str
    image_url: str
    item: ClothingItem


class IngestResponse(BaseModel):
    user_id: str
    image_url: str
    notes: str
    items: list[SavedWardrobeItem]


class MatchQueryPlan(BaseModel):
    reasoning: str = Field(description="User-facing explanation of the match strategy.")
    match_text: str = Field(description="Short phrase to embed for vector search.")
    target_slots: list[Slot] = Field(
        description="Wardrobe slots to search for complementary pieces."
    )
    formality: list[Formality] = Field(
        description="Compatible formality levels for the search."
    )
    seasons: list[Season] = Field(description="Relevant seasons for the occasion or look.")
    preferred_colors: list[Color] = Field(
        description="Colors that pair well with the query."
    )
    style_tags: list[StyleTag] = Field(description="Style tags that fit the query.")
    exclude_slots: list[Slot] = Field(
        description="Slots already covered by the query image (empty for text queries)."
    )


class FindImageRequest(BaseModel):
    user_id: str = Field(min_length=1)
    image_url: HttpUrl


class FindTextRequest(BaseModel):
    user_id: str = Field(min_length=1)
    text: str = Field(min_length=1)


class FindMatch(BaseModel):
    id: str
    image_url: str
    score: float
    slot: Slot
    category: Category
    formality: Formality
    primary_colors: list[Color]
    style_tags: list[StyleTag]
    match_text: str
    description: str


class FindResponse(BaseModel):
    user_id: str
    reasoning: str
    matches: list[FindMatch]
