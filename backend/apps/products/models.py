from django.db import models
from django.utils.text import slugify
from django.utils.html import escape
from django.db.models import Avg
from simple_history.models import HistoricalRecords
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    history = HistoricalRecords()

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return escape(self.name)


class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(unique=True, blank=True, db_index=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    compare_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="products", db_index=True
    )
    image = models.ImageField(upload_to="products/", blank=True)
    stock = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    # Progressive image loading fields
    thumbnail_url = models.URLField(blank=True, max_length=500)
    blurhash = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    view_count = models.PositiveIntegerField(default=0)
    # SEO fields
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["is_featured", "is_active"]),
            models.Index(fields=["price"]),
            models.Index(fields=["-created_at"]),  # For newest first sorting
            models.Index(fields=["-view_count"]),  # For most popular sorting
            models.Index(fields=["name"]),  # For name sorting
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        # Generate SKU before saving if it doesn't exist
        if not self.sku:
            import uuid
            import time

            timestamp = int(time.time())
            unique_id = str(uuid.uuid4())[:8]
            self.sku = f"PRD-{timestamp}-{unique_id}-{slugify(self.name)[:10]}"

        # Generate thumbnail URL for Cloudinary images
        if self.image_url and not self.thumbnail_url:
            # Check if it's a Cloudinary URL
            if 'cloudinary.com' in self.image_url:
                # Insert thumbnail transformation into Cloudinary URL
                self.thumbnail_url = self.image_url.replace(
                    '/upload/', 
                    '/upload/w_100,q_auto,f_auto/'
                )
            elif self.image and hasattr(self.image, 'url'):
                # For ImageField, try to generate thumbnail URL
                if 'cloudinary.com' in self.image.url:
                    self.thumbnail_url = self.image.url.replace(
                        '/upload/',
                        '/upload/w_100,q_auto,f_auto/'
                    )

        super().save(*args, **kwargs)

    @property
    def average_rating(self):
        """Calculate average rating for the product"""
        return self.reviews.aggregate(Avg("rating"))["rating__avg"] or 0

    @property
    def review_count(self):
        """Get total number of reviews for the product"""
        return self.reviews.count()

    @property
    def is_on_sale(self):
        return self.compare_price and self.compare_price > self.price

    @property
    def discount_percentage(self):
        if self.is_on_sale:
            return int(((self.compare_price - self.price) / self.compare_price) * 100)
        return 0

    def __str__(self):
        return escape(self.name)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="products/gallery/", blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{escape(self.product.name)} - Image {self.id}"


class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wishlist")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}'s Wishlist"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(
        Wishlist, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("wishlist", "product")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.product.name} in wishlist"
