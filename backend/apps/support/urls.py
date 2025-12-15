from django.urls import path
from . import views

app_name = "support"

urlpatterns = [
    # Health check
    path("health/", views.health_check, name="health"),
    # Create support message (accessible to everyone)
    path("messages/", views.CreateSupportMessageView.as_view(), name="create-message"),
    # User's conversations (authenticated only)
    path(
        "my-conversations/",
        views.MyConversationsView.as_view(),
        name="my-conversations",
    ),
    path(
        "conversations/<int:pk>/",
        views.ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        views.ConversationMessagesView.as_view(),
        name="conversation-messages",
    ),
]
