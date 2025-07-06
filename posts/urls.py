from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet, CommentViewSet, LikeViewSet,
    AdminPostViewSet, AdminCommentViewSet
)

like_delete = LikeViewSet.as_view({'delete': 'destroy'})

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'admin-posts', AdminPostViewSet, basename='admin-posts')
router.register(r'admin-comments', AdminCommentViewSet, basename='admin-comments')


urlpatterns = router.urls + [
    path('likes/delete/<int:pk>/', like_delete, name='like-delete'),
]
