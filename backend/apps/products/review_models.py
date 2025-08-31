from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from .models import Product

User = get_user_model()

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.product.name} - {self.rating} stars by {self.user.email}'

class ReviewHelpful(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_helpful = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('review', 'user')