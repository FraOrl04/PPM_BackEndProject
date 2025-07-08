# posts/serializers.py
from rest_framework import serializers
from .models import Post, Comment, Like
from accounts.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'text', 'created_at']
        read_only_fields = ['author', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user']

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    likes = LikeSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()  # Nuovo campo

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'image', 'image_url', 'created_at', 'comments', 'likes', 'likes_count']
        read_only_fields = ['author', 'created_at']
        extra_kwargs = {
            'image': {'write_only': True}  # Nasconde il campo image nella risposta
        }

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None