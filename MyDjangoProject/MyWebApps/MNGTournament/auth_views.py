from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from .models import PlayerTournament, Player
from django.contrib.auth.models import User
import re

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        email = request.data.get('email', '').strip()

        # Validación de campos obligatorios vacíos
        if not username or not password or not email:
            return Response(
                {'error': 'El usuario, la contraseña y el correo electrónico son obligatorios.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Expresión regular para validar cualquier estructura de correo electrónico estándar
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return Response(
                {'error': 'Por favor, ingresa una dirección de correo electrónico válida.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación de nombre de usuario único
        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {'error': f'El nombre de usuario "{username}" ya se encuentra registrado.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación de correo electrónico único
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'Este correo electrónico ya está asociado a otra cuenta.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Usamos una transacción para asegurar que ambos modelos se creen juntos o ninguno
            with transaction.atomic():
                # 1. Crear el usuario en Django / Supabase
                user = User.objects.create_user(
                    username=username, 
                    password=password, 
                    email=email
                )

                # 2. Crear y vincular automáticamente el perfil de Player
                Player.objects.create(
                    user=user,
                    gamertag=username,  # Usamos su username como gamertag inicial
                    email=email
                )

            return Response(
                {'message': 'Usuario registrado y perfil de jugador creado exitosamente.'}, 
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'error': f'Hubo un problema interno al procesar el registro: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomAuthToken(ObtainAuthToken):
    """
    Controlador personalizado para el inicio de sesión.
    Devuelve el token junto con el rol del usuario para el frontend.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'username': user.username,
            'is_admin': user.is_staff  # Devuelve True si es administrador de Django
        })
    
class UserProfileView(APIView):
    """
    Devuelve la información del perfil del usuario logueado
    junto con el historial de torneos en los que está inscrito.
    """
    permission_classes = [IsAuthenticated] # Obligatorio estar logueado para ver su propio perfil

    def get(self, request):
        user = request.user
        
        # Buscar las inscripciones del jugador asociado a este usuario
        # Filtramos por el modelo intermedia que conecta al jugador con sus torneos
        inscripciones = PlayerTournament.objects.filter(player__user=user)
        
        torneos_data = []
        for inscripcion in inscripciones:
            torneo = inscripcion.tournament
            torneos_data.append({
                'id': torneo.id,
                'name': torneo.name,
                'start_date': torneo.start_date,
                'status': inscripcion.status if hasattr(inscripcion, 'status') else 'Inscrito', # Por si usas estados como 'Eliminado' o 'Activo'
            })

        profile_data = {
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_staff,
            'tournaments': torneos_data
        }
        
        return Response(profile_data, status=status.HTTP_200_OK)