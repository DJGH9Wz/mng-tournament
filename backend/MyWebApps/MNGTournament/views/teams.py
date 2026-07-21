from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .permissions import IsAdminOrReadOnly
from ..models.Team import Team
from ..models.Player import Player
from ..models.TeamMember import TeamMember
from ..serializers import TeamSerializer


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAdminOrReadOnly]

    def _resolve_members(self, raw_member_ids):
        user_ids = []
        for mid in raw_member_ids:
            try:
                player = Player.objects.select_related('user').get(pk=mid)
                if player.user_id:
                    user_ids.append(player.user_id)
            except Player.DoesNotExist:
                pass
        return user_ids

    def create(self, request, *args, **kwargs):
        data = dict(request.data)
        member_ids = data.pop('members', [])
        user_ids = self._resolve_members(member_ids)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        team = serializer.save()

        for uid in user_ids:
            TeamMember.objects.get_or_create(team=team, user_id=uid)

        return Response(self.get_serializer(team).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        data = dict(request.data)
        member_ids = data.pop('members', None)

        new_captain_id = data.get('captain')
        old_captain_id = instance.captain_id

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        team = serializer.save()

        if new_captain_id and int(new_captain_id) != old_captain_id:
            old_captain_user = old_captain_id
            new_captain_user_id = int(new_captain_id)
            Player.objects.filter(user_id=old_captain_user).update(role='player')
            Player.objects.filter(user_id=new_captain_user_id).update(role='captain', team=team)

        if member_ids is not None:
            user_ids = self._resolve_members(member_ids)
            TeamMember.objects.filter(team=team).exclude(user_id__in=user_ids).delete()
            for uid in user_ids:
                TeamMember.objects.get_or_create(team=team, user_id=uid)

        return Response(self.get_serializer(team).data)

    @action(detail=True, methods=['post'], url_path='remove-member')
    def remove_member(self, request, pk=None):
        team = self.get_object()

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'Falta user_id.'}, status=status.HTTP_400_BAD_REQUEST)

        if team.captain_id == int(user_id):
            return Response({'error': 'No puedes eliminar al capitán del equipo.'}, status=status.HTTP_400_BAD_REQUEST)

        removed = TeamMember.objects.filter(team=team, user_id=user_id).delete()
        if removed[0] == 0:
            return Response({'error': 'El usuario no es miembro de este equipo.'}, status=status.HTTP_404_NOT_FOUND)

        Player.objects.filter(user_id=user_id, team=team).update(team=None)

        return Response({'message': 'Miembro eliminado del equipo.'})

    @action(detail=True, methods=['get'], url_path='members')
    def list_members(self, request, pk=None):
        team = self.get_object()
        memberships = TeamMember.objects.filter(team=team).select_related('user')
        result = []
        for m in memberships:
            player = Player.objects.filter(user=m.user).first()
            result.append({
                'user_id': m.user.id,
                'username': m.user.username,
                'gamertag': player.gamertag if player else m.user.username,
                'email': m.user.email,
                'rank': player.rank if player else None,
                'is_captain': m.user_id == team.captain_id,
            })
        return Response(result)
