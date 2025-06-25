from django.urls import path
from .views import UserList, RegisterUserView, FollowUserView, UserAdminViewSet, AdminSelfView
from rest_framework.routers import DefaultRouter
from .token_views import CustomTokenObtainPairView

urlpatterns = [
    path('', UserList.as_view()),
    path('register/', RegisterUserView.as_view()),
    path('follow/<str:username>/', FollowUserView.as_view(), name='follow-user'),
path('token/', CustomTokenObtainPairView.as_view(), name='custom_token_obtain_pair'),
    path('admin-users/', AdminSelfView.as_view()),

]

router = DefaultRouter()
router.register('admin-users', UserAdminViewSet, basename='admin-users')

urlpatterns += router.urls