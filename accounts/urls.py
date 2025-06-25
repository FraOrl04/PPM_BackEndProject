from django.urls import path
from .views import UserList, RegisterUserView, FollowUserView, UserAdminViewSet, AdminSelfView
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('', UserList.as_view()),
    path('register/', RegisterUserView.as_view()),
    path('follow/<str:username>/', FollowUserView.as_view(), name='follow-user'),
    path('admin-users/', AdminSelfView.as_view()),

]

router = DefaultRouter()
router.register('admin-users', UserAdminViewSet, basename='admin-users')

urlpatterns += router.urls