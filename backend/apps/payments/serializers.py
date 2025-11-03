from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"

    def validate(self, data):
        required_fields = ["order", "method", "amount", "currency"]
        # 'user' is set in perform_create, not required from client
        for field in required_fields:
            if field not in data or data[field] in [None, ""]:
                raise serializers.ValidationError({field: "This field is required."})
        return data
