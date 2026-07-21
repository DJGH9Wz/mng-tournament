from rest_framework import viewsets

from .permissions import IsAdminOrReadOnly
from ..models.Organizer import Organizer
from ..serializers import OrganizerSerializer


class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [IsAdminOrReadOnly]
