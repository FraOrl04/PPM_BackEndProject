from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import get_user_model
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    followers = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    following = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'following', 'followers', 'is_staff']


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer per l'aggiornamento del profilo utente
    """

    class Meta:
        model = CustomUser
        fields = ['bio']

    def validate_bio(self, value):
        if len(value) > 500:
            raise serializers.ValidationError("Bio cannot exceed 500 characters.")
        return value


User = get_user_model()
