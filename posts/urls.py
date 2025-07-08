from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet, CommentViewSet, LikeViewSet,
    AdminPostViewSet, AdminCommentViewSet
)
like_delete = LikeViewSet.as_view({'delete': 'destroy'})
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet)
router.register(r'admin-posts', AdminPostViewSet, basename='admin-posts')
router.register(r'admin-comments', AdminCommentViewSet, basename='admin-comments')
router.register(r'likes', LikeViewSet, basename='like')


urlpatterns = router.urls